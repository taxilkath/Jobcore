import { Request, Response } from 'express';
import { Types } from 'mongoose';
import UserJob from '../models/UserJob';
import Job from '../models/Job';
import Company from '../models/Company';

export const saveJob = async (req: Request, res: Response): Promise<void> => {
  try {
    let { userId, jobId, jobTitle, companyName, location, applicationUrl, fullJobData } = req.body;

    // If jobId is missing but we have fullJobData.id, use that
    if (!jobId && fullJobData && fullJobData.id) {
      jobId = fullJobData.id.toString();
      console.log('Extracted jobId from fullJobData.id:', jobId);
    }

    if (!userId || !jobId || !jobTitle || !companyName) {
      res.status(400).json({ 
        error: 'Missing required fields: userId, jobId, jobTitle, companyName' 
      });
      return;
    }

    // Check if job is already saved
    const existingJob = await UserJob.findOne({ userId, jobId });
    if (existingJob) {
      res.status(409).json({ 
        message: 'Job already saved',
        userJob: existingJob 
      });
      return;
    }

    // Handle external jobs - save full job details to jobs table first
    if (fullJobData && fullJobData.external && fullJobData.source) {
      try {
        // First, find or create the company
        let company = await Company.findOne({ name: companyName });
        if (!company) {
          company = new Company({
            name: companyName,
            description: fullJobData.company?.description || null,
            logo_url: fullJobData.company?.logo_url || null,
            slug: fullJobData.company?.title || companyName.toLowerCase().replace(/\s+/g, '-')
          });
          await company.save();
          console.log(`Created new company: ${companyName}`);
        }

        // Check if this external job is already in our jobs table by external ID
        const existingInternalJob = await Job.findOne({
          id: jobId // Use the external job ID to check for duplicates
        });

        if (!existingInternalJob) {
          // Build comprehensive description from all available fields
          let enhancedDescription = fullJobData.description || 'External job - see original posting for details';
          let enhancedDescriptionHtml = fullJobData.description_html || fullJobData.description || '';
          
          // Extract additional fields if they exist
          const additionalSections = [];
          
          // Add social sharing description if available
          if (fullJobData.socialSharingDescription) {
            additionalSections.push(`**Overview**: ${fullJobData.socialSharingDescription}`);
            enhancedDescriptionHtml += `<div class="job-section"><h3>Overview</h3><p>${fullJobData.socialSharingDescription}</p></div>`;
          }
          
          // Add requirements section if available
          if (fullJobData.requirementsSection) {
            additionalSections.push(`**Requirements**: ${fullJobData.requirementsSection}`);
            enhancedDescriptionHtml += `<div class="job-section"><h3>Requirements</h3><div>${fullJobData.requirementsSection}</div></div>`;
          }
          
          // Add benefits section if available
          if (fullJobData.benefitsSection) {
            additionalSections.push(`**Benefits**: ${fullJobData.benefitsSection}`);
            enhancedDescriptionHtml += `<div class="job-section"><h3>Benefits</h3><div>${fullJobData.benefitsSection}</div></div>`;
          }
          
          // Add company information if available
          if (fullJobData.company && typeof fullJobData.company === 'object') {
            const companyInfo = [];
            if (fullJobData.company.description) {
              companyInfo.push(`About the Company: ${fullJobData.company.description}`);
            }
            if (fullJobData.company.size) {
              companyInfo.push(`Company Size: ${fullJobData.company.size}`);
            }
            if (fullJobData.company.industry) {
              companyInfo.push(`Industry: ${fullJobData.company.industry}`);
            }
            if (fullJobData.company.website) {
              companyInfo.push(`Website: ${fullJobData.company.website}`);
            }
            
            if (companyInfo.length > 0) {
              additionalSections.push(`**Company Information**: ${companyInfo.join(' | ')}`);
              enhancedDescriptionHtml += `<div class="job-section"><h3>Company Information</h3><p>${companyInfo.join('<br>')}</p></div>`;
            }
          }
          
          // Append additional sections to description if any exist
          if (additionalSections.length > 0) {
            enhancedDescription += '\n\n' + additionalSections.join('\n\n');
          }

          // Save the external job to our jobs table
          const newJob = new Job({
            id: jobId, // Set the external job ID
            title: jobTitle,
            company: company._id,
            location: location || 'Remote',
            description: enhancedDescription,
            description_html: enhancedDescriptionHtml,
            requirements: fullJobData.requirements || [],
            salary: fullJobData.salary || null,
            publishedAt: fullJobData.publishedat ? new Date(fullJobData.publishedat) : new Date(),
            url: fullJobData.url || fullJobData.apply_url || applicationUrl,
            applicationUrl: applicationUrl || fullJobData.apply_url,
            external: true // Mark as external job
          });

          await newJob.save();
          console.log(`Saved external job to internal database with enhanced details: ${jobTitle} at ${companyName}`);
        }
      } catch (externalJobError) {
        console.error('Error saving external job to internal database:', externalJobError);
        // Continue with saving to UserJob even if internal job saving fails
      }
    }

    // Create new saved job relationship
    const userJob = new UserJob({
      userId,
      jobId,
      jobTitle,
      companyName,
      location,
      applicationUrl,
      fullJobData: fullJobData || null // Store complete job data for external jobs
    });

    await userJob.save();
    res.status(201).json({ 
      message: 'Job saved successfully',
      userJob,
      externalJobSaved: !!(fullJobData && fullJobData.external)
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSavedJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const savedJobs = await UserJob.find({ userId })
      .sort({ savedAt: -1 })
      .limit(100); // Limit to 100 most recent

    res.json({ 
      savedJobs,
      count: savedJobs.length 
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeSavedJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, jobId } = req.params;

    if (!userId || !jobId) {
      res.status(400).json({ error: 'User ID and Job ID are required' });
      return;
    }

    const result = await UserJob.findOneAndDelete({ userId, jobId });

    if (!result) {
      res.status(404).json({ error: 'Saved job not found' });
      return;
    }

    res.json({ 
      message: 'Job removed from saved jobs',
      removedJob: result 
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkIfJobSaved = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, jobId } = req.params;

    if (!userId || !jobId) {
      res.status(400).json({ error: 'User ID and Job ID are required' });
      return;
    }

    const savedJob = await UserJob.findOne({ userId, jobId });
    
    res.json({ 
      isSaved: !!savedJob,
      savedJob: savedJob || null
    });
  } catch (error) {
    console.error('Error checking if job is saved:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSavedJobsWithDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Only get jobs that are not applied (applied: false)
    const savedJobs = await UserJob.find({ userId, applied: false })
      .sort({ savedAt: -1 })
      .limit(100);

    // Transform saved jobs with full details
    const jobsWithDetails = await Promise.all(
      savedJobs.map(async (savedJob) => {
        const jobData = savedJob.toObject();
        // First priority: Use stored fullJobData if available (for external jobs)
        if (jobData.fullJobData) {
          const fullData = jobData.fullJobData;
          
          // Build enhanced description from fullJobData with all available sections
          let enhancedDescription = fullData.description || 'View full details on the original job posting.';
          let enhancedDescriptionHtml = fullData.description_html || fullData.description || '';
          
          // Add additional sections if they exist in fullJobData
          const additionalSections = [];
          
          if (fullData.socialSharingDescription && !enhancedDescription.includes(fullData.socialSharingDescription)) {
            additionalSections.push(`**Overview**: ${fullData.socialSharingDescription}`);
            enhancedDescriptionHtml += `<div class="job-section"><h3>Overview</h3><p>${fullData.socialSharingDescription}</p></div>`;
          }
          
          if (fullData.requirementsSection && !enhancedDescription.includes(fullData.requirementsSection)) {
            additionalSections.push(`**Requirements**: ${fullData.requirementsSection}`);
            enhancedDescriptionHtml += `<div class="job-section"><h3>Requirements</h3><div>${fullData.requirementsSection}</div></div>`;
          }
          
          if (fullData.benefitsSection && !enhancedDescription.includes(fullData.benefitsSection)) {
            additionalSections.push(`**Benefits**: ${fullData.benefitsSection}`);
            enhancedDescriptionHtml += `<div class="job-section"><h3>Benefits</h3><div>${fullData.benefitsSection}</div></div>`;
          }
          
          if (fullData.company && typeof fullData.company === 'object') {
            const companyInfo = [];
            if (fullData.company.description) companyInfo.push(`About: ${fullData.company.description}`);
            if (fullData.company.size) companyInfo.push(`Size: ${fullData.company.size}`);
            if (fullData.company.industry) companyInfo.push(`Industry: ${fullData.company.industry}`);
            
            if (companyInfo.length > 0) {
              additionalSections.push(`**Company**: ${companyInfo.join(' | ')}`);
              enhancedDescriptionHtml += `<div class="job-section"><h3>Company</h3><p>${companyInfo.join('<br>')}</p></div>`;
            }
          }
          
          if (additionalSections.length > 0) {
            enhancedDescription += '\n\n' + additionalSections.join('\n\n');
          }

          return {
            ...jobData,
            // Use fullJobData for external jobs
            _id: fullData._id || jobData.jobId,
            id: jobData.jobId,
            title: fullData.title || jobData.jobTitle,
            company: fullData.company || { 
              name: jobData.companyName,
              logo_url: fullData.company?.logo_url || null 
            },
            location: fullData.location || jobData.location || 'Remote',
            description: enhancedDescription,
            description_html: enhancedDescriptionHtml,
            requirements: fullData.requirements || [],
            salary: fullData.salary,
            publishedAt: fullData.publishedat ? new Date(fullData.publishedat) : jobData.savedAt,
            applicationUrl: jobData.applicationUrl || fullData.apply_url || fullData.applyUrl,
            apply_url: jobData.applicationUrl || fullData.apply_url || fullData.applyUrl,
            applyUrl: jobData.applicationUrl || fullData.apply_url || fullData.applyUrl,
            employmentType: fullData.type || 'Full-time',
            isRemote: fullData.location?.toLowerCase().includes('remote') || fullData.remote,
            savedAt: jobData.savedAt,
            applied: jobData.applied,
            department: fullData.department,
            external: fullData.external || true,
            source: fullData.source,
            // Include additional sections for reference
            benefitsSection: fullData.benefitsSection,
            requirementsSection: fullData.requirementsSection,
            socialSharingDescription: fullData.socialSharingDescription
          };
        }
        
        // Second priority: Try to find the job in our internal collection
        
        try {
          const internalJobs = await Job.aggregate([
            {
              $lookup: {
                from: 'companies',
                localField: 'company',
                foreignField: '_id',
                as: 'company'
              }
            },
            {
              $match: {
                _id: new Types.ObjectId(jobData.jobId)
              }
            },
            {
              $limit: 1
            }
          ]);

          if (internalJobs && internalJobs.length > 0) {
            const internalJob = internalJobs[0];
            const company = internalJob.company && internalJob.company[0] ? internalJob.company[0] : null;
            
            // Return the full job details from internal collection
            return {
              ...jobData,
              _id: internalJob._id,
              id: jobData.jobId,
              title: internalJob.title,
              company: company,
              location: internalJob.location,
              description: internalJob.description,
              description_html: internalJob.description_html,
              requirements: internalJob.requirements,
              salary: internalJob.salary,
              publishedAt: internalJob.publishedAt,
              url: internalJob.url || internalJob.applicationUrl,
              applicationUrl: internalJob.applicationUrl || internalJob.url,
              apply_url: internalJob.url || internalJob.applicationUrl,
              applyUrl: internalJob.url || internalJob.applicationUrl,
              employmentType: 'Full-time',
              isRemote: internalJob.location?.toLowerCase().includes('remote'),
              savedAt: jobData.savedAt,
              applied: jobData.applied,
              department: null,
              external: false
            };
          }
        } catch (error) {
          console.error(`Error fetching internal job for ${jobData.jobTitle}:`, error);
        }

        // Fallback: Basic job data if no fullJobData and not found in internal collection
        return {
          ...jobData,
          _id: jobData.jobId,
          id: jobData.jobId,
          title: jobData.jobTitle,
          company: { 
            name: jobData.companyName,
            logo_url: null 
          },
          location: jobData.location || 'Remote',
          savedAt: jobData.savedAt,
          applied: jobData.applied,
          description: 'View full details on the original job posting.',
          description_html: 'View full details on the original job posting.',
          employmentType: 'Full-time',
          isRemote: !jobData.location || jobData.location.toLowerCase().includes('remote'),
          publishedAt: jobData.savedAt,
          requirements: ['View full requirements on the original job posting'],
          salary: null,
          applicationUrl: jobData.applicationUrl,
          apply_url: jobData.applicationUrl,
          applyUrl: jobData.applicationUrl,
          department: null,
          external: true
        };
      })
    );

    res.json({ 
      savedJobs: jobsWithDetails,
      count: jobsWithDetails.length 
    });
  } catch (error) {
    console.error('Error fetching saved jobs with details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New function to get applied jobs
export const getAppliedJobsWithDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Only get jobs that are applied (applied: true)
    const appliedJobs = await UserJob.find({ userId, applied: true })
      .sort({ appliedAt: -1 })
      .limit(100);

    // Format applied jobs for the frontend
    const jobsWithDetails = appliedJobs.map((appliedJob) => {
      const jobData = appliedJob.toObject();
      return {
        id: jobData.jobId,
        title: jobData.jobTitle,
        company: jobData.companyName,
        location: jobData.location || 'Remote',
        salary: 'N/A',
        appliedDate: jobData.appliedAt ? new Date(jobData.appliedAt).toLocaleDateString() : new Date(jobData.savedAt).toLocaleDateString(),
        status: 'Application Sent',
        resumeUsed: 'Standard Resume',
        isAiTailored: false,
        logo: null
      };
    });

    res.json({ 
      appliedJobs: jobsWithDetails,
      count: jobsWithDetails.length 
    });
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New function to mark job as applied
export const markJobAsApplied = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, jobId } = req.params;

    if (!userId || !jobId) {
      res.status(400).json({ error: 'User ID and Job ID are required' });
      return;
    }

    const updatedJob = await UserJob.findOneAndUpdate(
      { userId, jobId },
      { 
        applied: true, 
        appliedAt: new Date() 
      },
      { new: true }
    );

    if (!updatedJob) {
      res.status(404).json({ error: 'Saved job not found' });
      return;
    }

    res.json({ 
      message: 'Job marked as applied successfully',
      userJob: updatedJob 
    });
  } catch (error) {
    console.error('Error marking job as applied:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 