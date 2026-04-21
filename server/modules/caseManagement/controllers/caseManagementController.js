const Client = require('../models/Client');
const Case = require('../models/Case');
const User = require('../../auth/models/User');
const { sendCaseCreationEmail } = require('../services/emailService');
const { createAndSendNotification } = require('../../notificationManagement/services/notificationService');

// ==================== CLIENTS ====================

// @desc    Get all clients with pagination
// @route   GET /api/clients
// @access  Private
const getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Client.countDocuments();
    const clients = await Client.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit: limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching clients',
      error: error.message
    });
  }
};

// @desc    Create new client
// @route   POST /api/clients
// @access  Private
const createClient = async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const existingClient = await Client.findOne({ email: email.toLowerCase() });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }

    const client = await Client.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      status: status || 'active',
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client }
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating client',
      error: error.message
    });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, status } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (name) client.name = name;
    if (email) client.email = email.toLowerCase();
    if (phone) client.phone = phone;
    if (address) client.address = address;
    if (status) client.status = status;

    await client.save();

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating client',
      error: error.message
    });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if client has cases
    const caseCount = await Case.countDocuments({ client: id });
    if (caseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete client. They have ${caseCount} associated case(s).`
      });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    await Client.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting client',
      error: error.message
    });
  }
};

// ==================== CASES ====================

// @desc    Get all cases with pagination
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Case.countDocuments();
    const cases = await Case.find()
      .populate('client', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        cases,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit: limit,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cases',
      error: error.message
    });
  }
};

// @desc    Create new case
// @route   POST /api/cases
// @access  Private
const createCase = async (req, res) => {
  try {
    const { title, description, client: clientId, caseType, status, priority, hearingDate, assignedTo } = req.body;

    if (!title || !clientId || !caseType) {
      return res.status(400).json({
        success: false,
        message: 'Title, client, and case type are required'
      });
    }

    // Verify client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const caseData = {
      title,
      description,
      client: clientId,
      caseType,
      status: status || 'open',
      priority: priority || 'medium',
      hearingDate,
      assignedTo,
      createdBy: req.user.userId
    };

    const newCase = await Case.create(caseData);

    // Populate the created case
    const populatedCase = await Case.findById(newCase._id)
      .populate('client', 'name email')
      .populate('assignedTo', 'name email');

    // Send internal notifications to admins and assigned user
    try {
      const admins = await User.find({ role: 'admin', isActive: true });
      const userIdsToNotify = new Set();
      
      // Notify admins
      admins.forEach(admin => userIdsToNotify.add(admin._id.toString()));
      
      // Notify assigned user
      if (assignedTo) {
        userIdsToNotify.add(assignedTo.toString());
      }
      
      const title = 'New Case Created';
      const message = `Case "${populatedCase.title}" has been created and assigned. Case number: ${populatedCase.caseNumber}.`;

      for (const userId of userIdsToNotify) {
        await createAndSendNotification(userId, { 
          title, 
          message, 
          type: 'case' 
        });
      }
    } catch (notifErr) {
      console.error('Failed to send internal notifications:', notifErr);
    }

    // Send email to client
    try {
      await sendCaseCreationEmail(client.email, client.name, {
        caseNumber: populatedCase.caseNumber,
        title: populatedCase.title,
        caseType: populatedCase.caseType,
        status: populatedCase.status,
        hearingDate: populatedCase.hearingDate,
        description: populatedCase.description
      });
    } catch (emailError) {
      console.error('Failed to send email to client:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Case created successfully and client notified',
      data: { case: populatedCase }
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating case',
      error: error.message
    });
  }
};

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, caseType, status, priority, hearingDate, assignedTo } = req.body;

    const caseItem = await Case.findById(id);
    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    const oldHearingDate = caseItem.hearingDate ? caseItem.hearingDate.getTime() : null;
    const oldAssignedTo = caseItem.assignedTo ? caseItem.assignedTo.toString() : null;

    if (title) caseItem.title = title;
    if (description) caseItem.description = description;
    if (caseType) caseItem.caseType = caseType;
    if (status) caseItem.status = status;
    if (priority) caseItem.priority = priority;
    if (hearingDate) caseItem.hearingDate = hearingDate;
    if (assignedTo) caseItem.assignedTo = assignedTo;

    await caseItem.save();

    const updatedCase = await Case.findById(id)
      .populate('client', 'name email')
      .populate('assignedTo', 'name email');

    // Send notifications if hearing date or assignment changed
    try {
      const newHearingDate = caseItem.hearingDate ? caseItem.hearingDate.getTime() : null;
      const newAssignedTo = caseItem.assignedTo ? caseItem.assignedTo.toString() : null;

      if (newHearingDate !== oldHearingDate || newAssignedTo !== oldAssignedTo) {
        const userIdsToNotify = new Set();
        const admins = await User.find({ role: 'admin', isActive: true });
        admins.forEach(admin => userIdsToNotify.add(admin._id.toString()));
        
        if (newAssignedTo) userIdsToNotify.add(newAssignedTo);
        if (oldAssignedTo) userIdsToNotify.add(oldAssignedTo);

        let titleNotif = 'Case Updated';
        let messageNotif = `Case "${updatedCase.title}" has been updated.`;

        if (newHearingDate !== oldHearingDate) {
          titleNotif = 'Hearing Date Changed';
          const timeStr = updatedCase.hearingDate.toLocaleDateString('en-IN', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true 
          });
          messageNotif = `The hearing for case "${updatedCase.title}" has been rescheduled to ${timeStr}.`;
        } else if (newAssignedTo !== oldAssignedTo) {
          titleNotif = 'Case Reassigned';
          messageNotif = `Case "${updatedCase.title}" has been reassigned to ${updatedCase.assignedTo ? updatedCase.assignedTo.name : 'someone else'}.`;
        }

        for (const userId of userIdsToNotify) {
          await createAndSendNotification(userId, { 
            title: titleNotif, 
            message: messageNotif, 
            type: 'case' 
          });
        }
      }
    } catch (notifErr) {
      console.error('Failed to send update notifications:', notifErr);
    }

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: { case: updatedCase }
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating case',
      error: error.message
    });
  }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private
const deleteCase = async (req, res) => {
  try {
    const { id } = req.params;

    const caseItem = await Case.findById(id);
    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    await Case.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting case',
      error: error.message
    });
  }
};

module.exports = {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getCases,
  createCase,
  updateCase,
  deleteCase
};
