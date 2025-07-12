interface WorkableJob {
  id: string;
  title?: string;
  state?: string;
  description?: string;
  socialSharingDescription?: string;
  employmentType?: string;
  benefitsSection?: string;
  requirementsSection?: string;
  url?: string;
  language?: string;
  locations?: string[];
  location?: {
    city?: string;
    subregion?: string;
    countryName?: string;
  };
  created?: string;
  updated?: string;
  company?: {
    id?: string;
    title?: string;
    website?: string;
    image?: string;
    description?: string;
    url?: string;
    socialSharingImage?: string;
    socialSharingDescription?: string;
  };
  workplace?: string;
  department?: string;
}

interface WorkableResponse {
  title: string;
  totalSize: number;
  nextPageToken?: string;
  jobs: WorkableJob[];
}

interface SmartRecruitersJob {
  id: string;
  name: string;
  company: {
    identifier: string;
    name: string;
    logo?: string;
  };
  releasedDate: string;
  location: {
    city?: string;
    country?: string;
    region?: string;
    remote?: boolean;
  };
  industry?: any;
  department?: any;
  function?: any;
  typeOfEmployment?: any;
  experienceLevel?: any;
  customField?: any[];
  actions: {
    details: string;
  };
  applyUrl: string;
  shortLocation: string;
  releasedAgo: string;
}

interface SmartRecruitersResponse {
  offset: number;
  limit: number;
  totalFound: number;
  content: SmartRecruitersJob[];
}

interface HiringCafeJob {
  id: string;
  board_token: string;
  source: string;
  apply_url: string;
  source_and_board_token: string;
  job_information: {
    title: string;
    description: string;
    appliedFromUsers?: string[];
    viewedByUsers?: string[];
    savedFromUsers?: string[];
  };
  v5_processed_job_data: {
    core_job_title: string;
    requirements_summary: string;
    technical_tools: string[];
    licenses_or_certifications: string[];
    associates_degree_requirement: string;
    associates_degree_fields_of_study: string[];
    bachelors_degree_requirement: string;
    bachelors_degree_fields_of_study: string[];
    masters_degree_requirement: string;
    masters_degree_fields_of_study: string[];
    doctorate_degree_requirement: string;
    doctorate_degree_fields_of_study: string[];
    licenses_or_certifications_not_mentioned: boolean;
    min_industry_and_role_yoe: number;
    "401k_matching": boolean;
    is_min_industry_and_role_yoe_not_mentioned: boolean;
    min_management_and_leadership_yoe: number | null;
    is_min_management_and_leadership_yoe_not_mentioned: boolean;
    job_category: string;
    role_activities: string[];
    commitment: string[];
    role_type: string;
    seniority_level: string;
    workplace_countries: string[];
    boundless_workplace_states: string[];
    boundless_workplace_countries: string[];
    boundless_workplace_continents: string[];
    workplace_continents: string[];
    workplace_states: string[];
    workplace_cities: string[];
    workplace_counties: string[];
    workplace_type: string;
    workplace_physical_environment: string;
    oral_communication_level: string;
    physical_labor_intensity: string;
    physical_position: string;
    computer_usage: string;
    cognitive_demand: string;
    air_travel_requirement: string;
    land_travel_requirement: string;
    morning_shift_work: string;
    evening_shift_work: string;
    overnight_work: string;
    formatted_workplace_location: string;
    on_call_requirement: string;
    weekend_availability_required: boolean;
    holiday_availability_required: boolean;
    generous_paid_time_off: boolean;
    four_day_work_week: boolean;
    overtime_required: boolean;
    is_workplace_worldwide_ok: boolean;
    language_requirements: string[];
    num_language_requirements: number;
    yearly_max_compensation: number | null;
    yearly_min_compensation: number | null;
    monthly_max_compensation: number | null;
    monthly_min_compensation: number | null;
    weekly_max_compensation: number | null;
    weekly_min_compensation: number | null;
    hourly_max_compensation: number | null;
    hourly_min_compensation: number | null;
    "bi-weekly_min_compensation": number | null;
    "bi-weekly_max_compensation": number | null;
    daily_min_compensation: number | null;
    daily_max_compensation: number | null;
    estimated_publish_date: string;
    fair_chance: boolean;
    visa_sponsorship: boolean;
    relocation_assistance: boolean;
    military_veterans: boolean;
    tuition_reimbursement: boolean;
    retirement_plan: boolean;
    generous_parental_leave: boolean;
    is_high_school_required: boolean;
    is_driver_license_required: boolean;
    is_compensation_transparent: boolean;
    listed_compensation_currency: string;
    listed_compensation_frequency: string;
    security_clearance: string;
    position_employer_type: string;
    company_name: string;
    company_website: string;
    company_sector_and_industry: string;
    company_activities: string[];
    company_tagline: string;
  };
  v5_processed_company_data: {
    name: string;
    image_url: string;
    subsidiaries: string[];
    parent_company: string | null;
    website: string;
    linkedin_url: string;
    industries: string[];
    activities: string[];
    tagline: string;
    is_non_profit: boolean;
    is_public_company: boolean;
    is_dissolved: boolean;
    is_acquired: boolean;
    num_employees: number;
    year_founded: number;
    headquarters_country: string;
    total_funding_amount: number | null;
    total_funding_currency: string | null;
    latest_investment_amount: number;
    latest_investment_currency: string;
    latest_investment_year: number;
    latest_investment_series: string;
    investors: string[];
    stock_exchange: string;
    stock_symbol: string;
    latest_revenue: number;
    latest_revenue_currency: string;
    latest_revenue_year: number;
  };
  _geoloc: {
    lat: number;
    lon: number;
  }[];
  objectID: string;
}

interface HiringCafeResponse {
  hits: HiringCafeJob[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
}

interface ExternalJobSearchParams {
  query?: string;
  location?: string;
  limit?: number;
  pageToken?: string;
  offset?: number;
}

export class ExternalJobService {
  private workableBaseUrl = 'https://jobs.workable.com/api/v1/jobs';
  private smartRecruitersBaseUrl = 'https://jobs.smartrecruiters.com/sr-jobs/search';
  private hiringCafeBaseUrl = 'https://hiring.cafe/api/search-jobs';

  async searchWorkableJobs(params: ExternalJobSearchParams): Promise<{
    jobs: any[];
    totalJobs: number;
    nextPageToken?: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.query) searchParams.append('query', params.query);
      if (params.location) searchParams.append('location', params.location);
      if (params.pageToken) searchParams.append('nextPageToken', params.pageToken);

      const url = `${this.workableBaseUrl}?${searchParams.toString()}`;
      console.log('Fetching from Workable:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`Workable API error: ${response.status}`);
        return { jobs: [], totalJobs: 0 };
      }

      const data: WorkableResponse = await response.json();

      // Transform Workable jobs to match our format
      const transformedJobs = data.jobs.map(job => this.transformWorkableJob(job));

      return {
        jobs: transformedJobs,
        totalJobs: data.totalSize || 0,
        nextPageToken: data.nextPageToken
      };
    } catch (error) {
      console.error('Error fetching Workable jobs:', error);
      return { jobs: [], totalJobs: 0 };
    }
  }

  private transformWorkableJob(job: WorkableJob): any {
    // Safely handle description - preserve full content and improve HTML handling
    const rawDescription = job.description || job.socialSharingDescription || '';
    const cleanDescription = rawDescription
      ? rawDescription
          .replace(/<br\s*\/?>/gi, '\n') // Convert <br> tags to newlines
          .replace(/<\/p>/gi, '\n\n') // Convert </p> to double newlines
          .replace(/<p[^>]*>/gi, '') // Remove <p> opening tags
          .replace(/<\/div>/gi, '\n') // Convert </div> to newlines
          .replace(/<div[^>]*>/gi, '') // Remove <div> opening tags
          .replace(/<li[^>]*>/gi, '• ') // Convert <li> to bullet points
          .replace(/<\/li>/gi, '\n') // Add newlines after list items
          .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
          .replace(/&amp;/g, '&') // Decode HTML entities
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\n\s+/g, '\n') // Clean up whitespace around newlines
          .trim()
      : 'No description available';

    // Extract requirements from requirementsSection if available
    let requirements: string[] = [];
    if (job.requirementsSection) {
      try {
        const cleanRequirements = job.requirementsSection
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<li[^>]*>/gi, '• ')
          .replace(/<\/li>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ');

        requirements = cleanRequirements
          .split(/[\n•]/) // Split by newlines or bullets
          .map(req => req.trim())
          .filter(req => req.length > 5 && req.length < 500) // More generous length limits
          .slice(0, 10); // Take more requirements
      } catch (error) {
        console.warn('Error parsing requirements:', error);
        requirements = [];
      }
    }

    // Process benefits section similarly
    let cleanBenefits = null;
    if (job.benefitsSection) {
      cleanBenefits = job.benefitsSection
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div[^>]*>/gi, '')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .trim();
    }

    // Create social sharing description safely
    const socialDescription = job.socialSharingDescription || 
      (cleanDescription ? cleanDescription.substring(0, 200) + '...' : '') ||
      'No description available';

    return {
      _id: `workable_${job.id}`,
      title: job.title || 'Untitled Position',
      company: {
        name: job.company?.title || 'Company Name Not Available',
        logo_url: job.company?.image || null,
        website: job.company?.website || null,
        description: job.company?.description || null
      },
      location: (job.location?.city && job.location?.countryName) 
        ? `${job.location.city}, ${job.location.countryName}`
        : (job.locations && job.locations.length > 0 ? job.locations[0] : 'Remote'),
      type: job.employmentType || 'Full-time',
      description: cleanDescription,
      description_html: job.description || null, // Keep original HTML for rich display
      requirements: requirements,
      salary: null, // Workable doesn't provide salary in this format
      publishedat: job.created ? new Date(job.created) : new Date(),
      apply_url: job.url || '',
      source: 'Workable',
      workplace: job.workplace || 'on-site',
      external: true, // Flag to identify external jobs
      department: job.department || job.company?.title || null,
      benefitsSection: cleanBenefits,
      benefitsSection_html: job.benefitsSection || null, // Keep original HTML
      requirementsSection: job.requirementsSection ? job.requirementsSection.replace(/<[^>]*>/g, '').trim() : null,
      socialSharingDescription: socialDescription,
      language: job.language || 'en',
      state: job.state || 'published'
    };
  }

  async searchSmartRecruitersJobs(params: ExternalJobSearchParams): Promise<{
    jobs: any[];
    totalJobs: number;
    nextPageToken?: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.query) searchParams.append('keyword', params.query);
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.offset) searchParams.append('offset', params.offset.toString());

      const url = `${this.smartRecruitersBaseUrl}?${searchParams.toString()}`;
      console.log('Fetching from SmartRecruiters:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`SmartRecruiters API error: ${response.status}`);
        return { jobs: [], totalJobs: 0 };
      }

      const data: SmartRecruitersResponse = await response.json();

      // Transform SmartRecruiters jobs to match our format
      const transformedJobs = await Promise.all(
        data.content.map(job => this.transformSmartRecruitersJob(job))
      );

      return {
        jobs: transformedJobs,
        totalJobs: data.totalFound || 0,
        nextPageToken: (params.offset || 0) + (params.limit || 100) < data.totalFound 
          ? ((params.offset || 0) + (params.limit || 100)).toString() 
          : undefined
      };
    } catch (error) {
      console.error('Error fetching SmartRecruiters jobs:', error);
      return { jobs: [], totalJobs: 0 };
    }
  }

  private async transformSmartRecruitersJob(job: SmartRecruitersJob): Promise<any> {
    // Fetch detailed job data from actions.details for complete information
    let detailedJobData: any = null;
    try {
      console.log('Fetching SmartRecruiters job details for:', job.id);
      const detailResponse = await fetch(job.actions.details);
      if (detailResponse.ok) {
        detailedJobData = await detailResponse.json();
      }
    } catch (error) {
      console.warn('Could not fetch detailed job data for job:', job.id, error);
    }

    // Build location string (prefer detailed data if available)
    let locationString = job.shortLocation || 'Remote';
    if (detailedJobData?.location) {
      const detailedLocation = detailedJobData.location;
      locationString = detailedLocation.fullLocation || locationString;
    } else {
      const locationParts = [];
      if (job.location.city) locationParts.push(job.location.city);
      if (job.location.region && job.location.region !== job.location.city) {
        locationParts.push(job.location.region);
      }
      if (job.location.country) {
        // Convert country code to readable name if needed
        const countryMap: { [key: string]: string } = {
          'us': 'United States', 'uk': 'United Kingdom', 'ca': 'Canada',
          'de': 'Germany', 'fr': 'France', 'es': 'Spain', 'it': 'Italy',
          'nl': 'Netherlands', 'pl': 'Poland', 'in': 'India', 'au': 'Australia',
          'br': 'Brazil', 'mx': 'Mexico', 'ar': 'Argentina', 'co': 'Colombia',
          'pe': 'Peru', 'cl': 'Chile', 'jp': 'Japan', 'cn': 'China',
          'sg': 'Singapore', 'my': 'Malaysia', 'th': 'Thailand', 'vn': 'Vietnam',
          'id': 'Indonesia', 'ph': 'Philippines', 'za': 'South Africa',
          'eg': 'Egypt', 'ma': 'Morocco', 'tn': 'Tunisia', 'ke': 'Kenya',
          'ng': 'Nigeria', 'se': 'Sweden', 'no': 'Norway', 'dk': 'Denmark',
          'fi': 'Finland', 'at': 'Austria', 'ch': 'Switzerland', 'be': 'Belgium',
          'pt': 'Portugal', 'ie': 'Ireland', 'cz': 'Czech Republic',
          'hu': 'Hungary', 'ro': 'Romania', 'bg': 'Bulgaria', 'hr': 'Croatia',
          'sk': 'Slovakia', 'si': 'Slovenia', 'lt': 'Lithuania', 'lv': 'Latvia',
          'ee': 'Estonia', 'ua': 'Ukraine', 'ru': 'Russia', 'tr': 'Turkey',
          'il': 'Israel', 'ae': 'United Arab Emirates', 'sa': 'Saudi Arabia',
          'qa': 'Qatar', 'kw': 'Kuwait', 'bh': 'Bahrain', 'om': 'Oman',
          'kr': 'South Korea', 'tw': 'Taiwan', 'hk': 'Hong Kong', 'nz': 'New Zealand'
        };
        const countryName = countryMap[job.location.country.toLowerCase()] || job.location.country.toUpperCase();
        locationParts.push(countryName);
      }
      if (locationParts.length > 0) {
        locationString = locationParts.join(', ');
      }
    }

    // Process detailed job data if available
    let jobDescription = 'View full job details on SmartRecruiters';
    let jobDescriptionHtml = null;
    let companyDescription = null;
    let qualifications = null;
    let additionalInformation = null;
    let requirements: string[] = [];
    let benefits: string[] = [];

    if (detailedJobData?.jobAd?.sections) {
      const sections = detailedJobData.jobAd.sections;
      
      // Extract job description
      if (sections.jobDescription?.text) {
        const rawHtml = sections.jobDescription.text;
        jobDescriptionHtml = rawHtml;
        
        // Convert HTML to clean text for description field
        jobDescription = rawHtml
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<\/div>/gi, '\n')
          .replace(/<div[^>]*>/gi, '')
          .replace(/<li[^>]*>/gi, '• ')
          .replace(/<\/li>/gi, '\n')
          .replace(/<ul[^>]*>/gi, '\n')
          .replace(/<\/ul>/gi, '\n')
          .replace(/<ol[^>]*>/gi, '\n')
          .replace(/<\/ol>/gi, '\n')
          .replace(/<strong[^>]*>/gi, '**')
          .replace(/<\/strong>/gi, '**')
          .replace(/<em[^>]*>/gi, '*')
          .replace(/<\/em>/gi, '*')
          .replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#xa0;/g, ' ')
          .replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/\n\s+/g, '\n')
          .trim();

        // Extract requirements from job description
        const reqRegex = /(?:required|requirements|qualifications|must have|skills)[:\s]*([^.]*(?:\n[^.\n]*)*)/gi;
        const reqMatches = jobDescription.match(reqRegex);
        if (reqMatches) {
          requirements = reqMatches[0]
            .split(/[•\n-]/)
            .map(req => req.trim())
            .filter(req => req.length > 10 && req.length < 200)
            .slice(0, 8);
        }
      }

      // Extract company description
      if (sections.companyDescription?.text) {
        companyDescription = sections.companyDescription.text
          .replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&#xa0;/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .trim();
      }

      // Extract qualifications
      if (sections.qualifications?.text) {
        qualifications = sections.qualifications.text
          .replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&#xa0;/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .trim();
      }

      // Extract additional information (often contains benefits)
      if (sections.additionalInformation?.text) {
        additionalInformation = sections.additionalInformation.text
          .replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&')
          .replace(/&#xa0;/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .trim();
      }
    }

    // Determine job type from detailed data
    let jobType = 'Full-time';
    if (detailedJobData?.typeOfEmployment?.label) {
      jobType = detailedJobData.typeOfEmployment.label;
    } else if (job.location.remote) {
      jobType = 'Remote';
    }

    // Get experience level
    const experienceLevel = detailedJobData?.experienceLevel?.label || null;

    // Get industry and function
    const industry = detailedJobData?.industry?.label || null;
    const jobFunction = detailedJobData?.function?.label || null;

    // Build comprehensive description including all sections
    let comprehensiveDescription = jobDescription;
    if (qualifications && qualifications.length > 0) {
      comprehensiveDescription += '\n\n**Qualifications:**\n' + qualifications;
    }
    if (additionalInformation && additionalInformation.length > 0) {
      comprehensiveDescription += '\n\n**Additional Information:**\n' + additionalInformation;
    }

    // Build comprehensive HTML description
    let comprehensiveHtml = jobDescriptionHtml || '';
    const sections = detailedJobData?.jobAd?.sections;
    if (sections?.qualifications?.text) {
      comprehensiveHtml += '<div class="job-section"><h3>Qualifications</h3>' + sections.qualifications.text + '</div>';
    }
    if (sections?.additionalInformation?.text) {
      comprehensiveHtml += '<div class="job-section"><h3>Additional Information</h3>' + sections.additionalInformation.text + '</div>';
    }

    return {
      _id: `smartrecruiters_${job.id}`,
      title: detailedJobData?.name || job.name || 'Untitled Position',
      company: {
        name: detailedJobData?.company?.name || job.company.name || 'Company Name Not Available',
        logo_url: job.company.logo || null,
        website: null, // Not typically provided in SmartRecruiters API
        description: companyDescription
      },
      location: locationString,
      type: jobType,
      description: comprehensiveDescription,
      description_html: comprehensiveHtml,
      requirements: requirements,
      salary: null, // Not provided in SmartRecruiters API
      publishedat: job.releasedDate ? new Date(job.releasedDate) : new Date(),
      apply_url: detailedJobData?.applyUrl || job.applyUrl || '',
      source: 'SmartRecruiters',
      workplace: (detailedJobData?.location?.remote || job.location.remote) ? 'remote' : 'on-site',
      external: true, // Flag to identify external jobs
      department: jobFunction,
      benefitsSection: additionalInformation, // Additional info often contains benefits
      benefitsSection_html: sections?.additionalInformation?.text || null,
      requirementsSection: qualifications,
      requirementsSection_html: sections?.qualifications?.text || null,
      socialSharingDescription: jobDescription.substring(0, 200) + '...' || job.name || 'Job opportunity via SmartRecruiters',
      language: detailedJobData?.language?.code || 'en',
      state: detailedJobData?.active ? 'published' : 'closed',
      detailsUrl: job.actions.details, // Store for potential future use
      releasedAgo: job.releasedAgo,
      
      // Additional SmartRecruiters specific fields
      experienceLevel: experienceLevel,
      industry: industry,
      function: jobFunction,
      refNumber: detailedJobData?.refNumber || null,
      customField: detailedJobData?.customField || [],
      
      // Company description as separate field for saved jobs
      companyDescription: companyDescription
    };
  }

  async getSmartRecruitersJobDetails(detailsUrl: string): Promise<any> {
    try {
      console.log('Fetching SmartRecruiters job details:', detailsUrl);
      
      const response = await fetch(detailsUrl);
      
      if (!response.ok) {
        console.error(`SmartRecruiters details API error: ${response.status}`);
        return null;
      }

      const jobDetails = await response.json();
      
      // Extract additional fields that might be useful
      const enhancedDetails = {
        description: jobDetails.description || null,
        requirements: jobDetails.requirements || null,
        benefits: jobDetails.benefits || null,
        company: {
          ...jobDetails.company,
          description: jobDetails.company?.description || null,
          website: jobDetails.company?.website || null
        },
        department: jobDetails.department || null,
        function: jobDetails.function || null,
        experienceLevel: jobDetails.experienceLevel || null,
        typeOfEmployment: jobDetails.typeOfEmployment || null,
        customField: jobDetails.customField || []
      };

      return enhancedDetails;
    } catch (error) {
      console.error('Error fetching SmartRecruiters job details:', error);
      return null;
    }
  }

  async searchHiringCafeJobs(params: ExternalJobSearchParams): Promise<{
    jobs: any[];
    totalJobs: number;
    nextPageToken?: string;
  }> {
    try {
      const requestBody = {
        size: params.limit || 50,
        page: params.offset ? Math.floor(params.offset / (params.limit || 50)) : 0,
        searchState: {
          locations: [
            {
              formatted_address: "United Kingdom",
              types: ["country"],
              geometry: {
                location: {
                  lat: "52.5876",
                  lon: "-1.9828"
                }
              },
              id: "user_country",
              address_components: [
                {
                  long_name: "United Kingdom",
                  short_name: "GB",
                  types: ["country"]
                }
              ],
              options: {
                flexible_regions: [
                  "anywhere_in_continent",
                  "anywhere_in_world"
                ]
              }
            }
          ],
          workplaceTypes: [
            "Remote",
            "Hybrid",
            "Onsite"
          ],
          seniorityLevel: [
            "No Prior Experience Required",
            "Entry Level",
            "Mid Level",
            "Senior Level"
          ],
          roleTypes: [
            "Individual Contributor",
            "People Manager"
          ],
          searchQuery: params.query || "react",
          dateFetchedPastNDays: 121,
          sortBy: "default"
        }
      };

      console.log('Hiring.cafe request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.hiringCafeBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error(`Hiring.cafe API error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Hiring.cafe error response:', errorText);
        return { jobs: [], totalJobs: 0 };
      }

      const data = await response.json();
      console.log('Hiring.cafe response structure:', {
        keys: Object.keys(data),
        hasHits: !!data.hits,
        dataType: typeof data,
        isArray: Array.isArray(data)
      });

      // Handle different possible response formats
      let jobs = [];
      let totalJobs = 0;
      let hasNextPage = false;

      if (data.hits && Array.isArray(data.hits)) {
        // Expected format with hits array
        jobs = data.hits;
        totalJobs = data.nbHits || data.totalHits || data.hits.length;
        hasNextPage = data.page < (data.nbPages - 1) || false;
      } else if (Array.isArray(data)) {
        // Direct array response
        jobs = data;
        totalJobs = data.length;
        hasNextPage = false;
      } else if (data.results && Array.isArray(data.results)) {
        // Alternative format with results array
        jobs = data.results;
        totalJobs = data.total || data.totalResults || data.results.length;
        hasNextPage = data.hasMore || false;
      } else {
        console.error('Unexpected hiring.cafe response format:', data);
        return { jobs: [], totalJobs: 0 };
      }

      // Transform hiring.cafe jobs to match our format
      const transformedJobs = jobs.map((job: any) => this.transformHiringCafeJob(job));

      return {
        jobs: transformedJobs,
        totalJobs: totalJobs,
        nextPageToken: hasNextPage ? 'has_more' : undefined
      };
    } catch (error) {
      console.error('Error fetching hiring.cafe jobs:', error);
      return { jobs: [], totalJobs: 0 };
    }
  }

  private transformHiringCafeJob(job: any): any {
    try {
      // Add null checks for the nested data structures
      const jobData = job.v5_processed_job_data || {};
      const companyData = job.v5_processed_company_data || {};
      const jobInfo = job.job_information || {};
      
      // Clean HTML description
      const cleanDescription = jobInfo.description
        ? jobInfo.description
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<p[^>]*>/gi, '')
            .replace(/<\/div>/gi, '\n')
            .replace(/<div[^>]*>/gi, '')
            .replace(/<li[^>]*>/gi, '• ')
            .replace(/<\/li>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\n\s+/g, '\n')
            .trim()
        : 'No description available';

      // Build salary information
      let salary = null;
      if (jobData.yearly_min_compensation || jobData.yearly_max_compensation) {
        const min = jobData.yearly_min_compensation ? `${jobData.yearly_min_compensation.toLocaleString()}` : '';
        const max = jobData.yearly_max_compensation ? `${jobData.yearly_max_compensation.toLocaleString()}` : '';
        const currency = jobData.listed_compensation_currency || 'GBP';
        
        if (min && max) {
          salary = `${min} - ${max} ${currency} per year`;
        } else if (min) {
          salary = `From ${min} ${currency} per year`;
        } else if (max) {
          salary = `Up to ${max} ${currency} per year`;
        }
      }

      // Build requirements from technical tools and requirements summary
      const requirements = [];
      if (jobData.requirements_summary) {
        requirements.push(jobData.requirements_summary);
      }
      if (jobData.technical_tools && Array.isArray(jobData.technical_tools) && jobData.technical_tools.length > 0) {
        requirements.push(`Technical skills: ${jobData.technical_tools.join(', ')}`);
      }
      if (jobData.min_industry_and_role_yoe && !jobData.is_min_industry_and_role_yoe_not_mentioned) {
        requirements.push(`Minimum ${jobData.min_industry_and_role_yoe} years of experience required`);
      }

      return {
        _id: `hiringcafe_${job.id || Math.random().toString(36).substr(2, 9)}`,
        title: jobData.core_job_title || jobInfo.title || 'Untitled Position',
        company: {
          name: companyData.name || jobData.company_name || 'Company Name Not Available',
          logo_url: companyData.image_url || null,
          website: companyData.website || jobData.company_website || null,
          description: companyData.tagline || jobData.company_tagline || null
        },
        location: jobData.formatted_workplace_location || 'Location not specified',
        type: (jobData.commitment && Array.isArray(jobData.commitment) && jobData.commitment.length > 0) ? jobData.commitment[0] : 'Full-time',
        description: cleanDescription,
        description_html: jobInfo.description || cleanDescription,
        requirements: requirements,
        salary: salary,
        publishedat: jobData.estimated_publish_date ? new Date(jobData.estimated_publish_date) : new Date(),
        apply_url: job.apply_url || '',
        source: `Hiring.cafe (${job.source || 'Unknown'})`,
        workplace: jobData.workplace_type === 'Remote' ? 'remote' : jobData.workplace_type === 'Hybrid' ? 'hybrid' : 'on-site',
        external: true,
        department: jobData.job_category || null,
        benefitsSection: this.buildBenefitsSection(jobData),
        requirementsSection: jobData.requirements_summary || null,
        socialSharingDescription: cleanDescription.substring(0, 200) + '...' || jobData.core_job_title || 'Job opportunity via Hiring.cafe',
        language: (jobData.language_requirements && Array.isArray(jobData.language_requirements) && jobData.language_requirements.length > 0) ? jobData.language_requirements[0].toLowerCase() : 'en',
        state: 'published',
        
        // Additional hiring.cafe specific fields
        experienceLevel: jobData.seniority_level || null,
        industry: jobData.company_sector_and_industry || null,
        roleType: jobData.role_type || null,
        technicalTools: jobData.technical_tools || [],
        workplaceType: jobData.workplace_type || null,
        companySize: companyData.num_employees || null,
        companyFounded: companyData.year_founded || null,
        visaSponsorship: jobData.visa_sponsorship || false,
        relocationAssistance: jobData.relocation_assistance || false,
        
        // Company details
        companyDescription: companyData.tagline || jobData.company_tagline || null,
        companyActivities: companyData.activities || jobData.company_activities || [],
        companyIndustries: companyData.industries || [],
        
        // Geographic data
        geolocation: (job._geoloc && Array.isArray(job._geoloc) && job._geoloc.length > 0) ? job._geoloc[0] : null
      };
    } catch (error) {
      console.error('Error transforming hiring.cafe job:', error, job);
      // Return a minimal valid job object if transformation fails
      return {
        _id: `hiringcafe_error_${Math.random().toString(36).substr(2, 9)}`,
        title: job?.job_information?.title || job?.v5_processed_job_data?.core_job_title || 'Job Title Unavailable',
        company: {
          name: job?.v5_processed_company_data?.name || job?.v5_processed_job_data?.company_name || 'Company Name Unavailable',
          logo_url: null,
          website: null,
          description: null
        },
        location: 'Location not available',
        type: 'Full-time',
        description: 'Job description not available',
        description_html: 'Job description not available',
        requirements: [],
        salary: null,
        publishedat: new Date(),
        apply_url: job?.apply_url || '',
        source: 'Hiring.cafe',
        workplace: 'on-site',
        external: true,
        department: null,
        benefitsSection: null,
        requirementsSection: null,
        socialSharingDescription: 'Job opportunity via Hiring.cafe',
        language: 'en',
        state: 'published'
      };
    }
  }

  private buildBenefitsSection(jobData: any): string | null {
    const benefits = [];
    
    if (jobData.generous_paid_time_off) benefits.push('Generous paid time off');
    if (jobData.four_day_work_week) benefits.push('4-day work week');
    if (jobData.retirement_plan) benefits.push('Retirement plan');
    if (jobData.generous_parental_leave) benefits.push('Generous parental leave');
    if (jobData.tuition_reimbursement) benefits.push('Tuition reimbursement');
    if (jobData.visa_sponsorship) benefits.push('Visa sponsorship available');
    if (jobData.relocation_assistance) benefits.push('Relocation assistance');
    if (jobData["401k_matching"]) benefits.push('401k matching');
    
    return benefits.length > 0 ? benefits.join(', ') : null;
  }

  async searchAllExternalJobs(params: ExternalJobSearchParams): Promise<{
    jobs: any[];
    totalJobs: number;
    nextPageToken?: string;
  }> {
    try {
      // Fetch from all three platforms in parallel
      const [workableResults, smartRecruitersResults, hiringCafeResults] = await Promise.all([
        this.searchWorkableJobs({
          ...params,
          location: params.location || 'United Kingdom' // Default location
        }),
        this.searchSmartRecruitersJobs({
          ...params,
          limit: Math.min(params.limit || 50, 100), // SmartRecruiters has limits
          offset: params.offset || 0
        }),
        this.searchHiringCafeJobs({
          ...params,
          limit: Math.min(params.limit || 50, 50), // Hiring.cafe page size
          offset: params.offset || 0
        })
      ]);

      // Combine results from all platforms
      const allJobs = [
        ...workableResults.jobs,
        ...smartRecruitersResults.jobs,
        ...hiringCafeResults.jobs
      ];

      // Calculate total across all platforms
      const totalJobs = workableResults.totalJobs + smartRecruitersResults.totalJobs + hiringCafeResults.totalJobs;

      // Check if there are more results from any platform
      const hasMore = workableResults.nextPageToken || smartRecruitersResults.nextPageToken || hiringCafeResults.nextPageToken;

      return {
        jobs: allJobs,
        totalJobs: totalJobs,
        nextPageToken: hasMore ? 'has_more' : undefined
      };
    } catch (error) {
      console.error('Error fetching external jobs:', error);
      return { jobs: [], totalJobs: 0 };
    }
  }
}

export const externalJobService = new ExternalJobService(); 