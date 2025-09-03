import { Schema, model, models, Document } from 'mongoose';

export interface IAudioQueue extends Document {
  userId: string;
  organizationId?: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  audioUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  errorDetails?: any;
  
  // Medical context
  patientInfo?: {
    name?: string;
    age?: number;
    gender?: string;
    patientId?: string;
  };
  medicalContext?: {
    chiefComplaint?: string;
    visitType?: 'consultation' | 'follow-up' | 'emergency' | 'routine';
    urgency?: 'immediate' | 'same-day' | 'next-day' | 'routine';
  };
  
  // Processing details
  language: string;
  transcriptionResult?: {
    rawTranscript?: string;
    confidence?: number;
    processingTime?: number;
    hasComprehensiveNote?: boolean;
    hasICDCodes?: boolean;
    hasManagementPlan?: boolean;
  };
  
  // Medical note creation
  noteId?: string;
  timeSaved?: number;
  
  // Queue management
  position: number;
  estimatedProcessingTime?: number;
  startedAt?: Date;
  completedAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date; // Auto-cleanup old items
}

const AudioQueueSchema = new Schema<IAudioQueue>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  organizationId: {
    type: String,
    index: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  priority: {
    type: String,
    enum: ['urgent', 'high', 'normal', 'low'],
    default: 'normal',
    index: true
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastError: String,
  errorDetails: Schema.Types.Mixed,
  
  // Medical context
  patientInfo: {
    name: String,
    age: Number,
    gender: String,
    patientId: String
  },
  medicalContext: {
    chiefComplaint: String,
    visitType: {
      type: String,
      enum: ['consultation', 'follow-up', 'emergency', 'routine']
    },
    urgency: {
      type: String,
      enum: ['immediate', 'same-day', 'next-day', 'routine']
    }
  },
  
  // Processing details
  language: {
    type: String,
    default: 'en-US'
  },
  transcriptionResult: {
    rawTranscript: String,
    confidence: Number,
    processingTime: Number,
    hasComprehensiveNote: Boolean,
    hasICDCodes: Boolean,
    hasManagementPlan: Boolean
  },
  
  // Medical note creation
  noteId: String,
  timeSaved: Number,
  
  // Queue management
  position: {
    type: Number,
    required: true,
    index: true
  },
  estimatedProcessingTime: Number,
  startedAt: Date,
  completedAt: Date,
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
AudioQueueSchema.index({ userId: 1, status: 1, priority: 1, position: 1 });
AudioQueueSchema.index({ organizationId: 1, status: 1, priority: 1 });
AudioQueueSchema.index({ status: 1, priority: 1, createdAt: 1 });

// Pre-save middleware to update position
AudioQueueSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'pending') {
    // Get the highest position for this user/organization
    const highestPosition = await this.constructor.findOne(
      { 
        userId: this.userId, 
        organizationId: this.organizationId,
        status: 'pending' 
      },
      {},
      { sort: { position: -1 } }
    );
    
    this.position = (highestPosition?.position || 0) + 1;
  }
  
  this.updatedAt = new Date();
  next();
});

// Static method to get next item to process
AudioQueueSchema.statics.getNextItem = async function(userId?: string, organizationId?: string) {
  const query: any = { 
    status: 'pending',
    expiresAt: { $gt: new Date() }
  };
  
  if (userId) query.userId = userId;
  if (organizationId) query.organizationId = organizationId;
  
  return this.findOne(query, {}, { 
    sort: { 
      priority: 1, // urgent first
      position: 1  // then by position
    } 
  });
};

// Instance method to update status
AudioQueueSchema.methods.updateStatus = async function(newStatus: string, additionalData?: any) {
  this.status = newStatus;
  
  if (newStatus === 'processing') {
    this.startedAt = new Date();
  } else if (newStatus === 'completed' || newStatus === 'failed') {
    this.completedAt = new Date();
  }
  
  if (additionalData) {
    Object.assign(this, additionalData);
  }
  
  return this.save();
};

// Instance method to retry processing
AudioQueueSchema.methods.retry = async function() {
  if (this.retryCount < this.maxRetries) {
    this.retryCount += 1;
    this.status = 'pending';
    this.lastError = undefined;
    this.errorDetails = undefined;
    return this.save();
  } else {
    this.status = 'failed';
    this.lastError = 'Max retries exceeded';
    return this.save();
  }
};

export const AudioQueue = models.AudioQueue || model<IAudioQueue>('AudioQueue', AudioQueueSchema);
