const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Case title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required for this case']
  },
  caseType: {
    type: String,
    enum: ['civil', 'criminal', 'corporate', 'family', 'property', 'tax', 'labor', 'other'],
    required: [true, 'Case type is required']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'pending', 'closed', 'archived'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  hearingDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
caseSchema.index({ client: 1 });
caseSchema.index({ status: 1 });
caseSchema.index({ caseType: 1 });

// Generate case number before validation
caseSchema.pre('validate', async function() {
  if (!this.caseNumber) {
    const count = await mongoose.model('Case').countDocuments();
    this.caseNumber = `CASE-${String(count + 1).padStart(5, '0')}`;
  }
});

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
