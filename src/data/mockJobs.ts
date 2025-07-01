export const mockJobs = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full Time',
    salary: '$120k - $180k',
    description: 'We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for designing and developing scalable web applications using modern technologies. The ideal candidate has strong experience in React, Node.js, and cloud technologies.',
    postedDate: '2 days ago',
    tags: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'InnovateLabs',
    location: 'New York, NY',
    type: 'Full Time',
    salary: '$100k - $140k',
    description: 'Join our product team as a Product Manager where you will drive product strategy and execution. You will work closely with engineering, design, and business teams to deliver exceptional user experiences.',
    postedDate: '1 day ago',
    tags: ['Product Strategy', 'Agile', 'Analytics', 'User Research'],
    isBookmarked: true
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'DesignStudio',
    location: 'Remote',
    type: 'Remote',
    salary: '$80k - $120k',
    description: 'We are seeking a talented UX/UI Designer to create intuitive and visually appealing user interfaces. You will be responsible for the entire design process from concept to implementation.',
    postedDate: '3 days ago',
    tags: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    isBookmarked: false
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'DataTech Solutions',
    location: 'Seattle, WA',
    type: 'Full Time',
    salary: '$130k - $170k',
    description: 'Looking for a Data Scientist to analyze complex datasets and build predictive models. You will work with large-scale data infrastructure and machine learning algorithms.',
    postedDate: '1 week ago',
    tags: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
    isBookmarked: false
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudFirst',
    location: 'Austin, TX',
    type: 'Full Time',
    salary: '$110k - $150k',
    description: 'Join our DevOps team to build and maintain scalable infrastructure. You will work with containerization, CI/CD pipelines, and cloud platforms to ensure reliable software delivery.',
    postedDate: '4 days ago',
    tags: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform'],
    isBookmarked: false
  },
  {
    id: '6',
    title: 'Frontend Developer',
    company: 'WebCraft',
    location: 'Los Angeles, CA',
    type: 'Contract',
    salary: '$70k - $90k',
    description: 'We need a skilled Frontend Developer to create responsive and interactive web applications. Experience with modern JavaScript frameworks and CSS preprocessors is required.',
    postedDate: '5 days ago',
    tags: ['React', 'CSS', 'JavaScript', 'Responsive Design', 'Git'],
    isBookmarked: true
  },
  {
    id: '7',
    title: 'Marketing Manager',
    company: 'GrowthTech',
    location: 'Chicago, IL',
    type: 'Full Time',
    salary: '$85k - $110k',
    description: 'Lead our marketing efforts to drive brand awareness and customer acquisition. You will develop and execute marketing campaigns across multiple channels.',
    postedDate: '6 days ago',
    tags: ['Digital Marketing', 'SEO/SEM', 'Analytics', 'Content Strategy'],
    isBookmarked: false
  },
  {
    id: '8',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Boston, MA',
    type: 'Full Time',
    salary: '$95k - $130k',
    description: 'Join our small but mighty team as a Full Stack Developer. You will work on both frontend and backend development, helping to build our core product from the ground up.',
    postedDate: '1 week ago',
    tags: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    isBookmarked: false
  },
  {
    id: '9',
    title: 'Mobile App Developer',
    company: 'MobileFirst Inc.',
    location: 'Miami, FL',
    type: 'Full Time',
    salary: '$100k - $135k',
    description: 'Develop native mobile applications for iOS and Android platforms. You will work closely with our design team to create beautiful and functional mobile experiences.',
    postedDate: '3 days ago',
    tags: ['React Native', 'Swift', 'Kotlin', 'Mobile UI', 'API Integration'],
    isBookmarked: false
  },
  {
    id: '10',
    title: 'Cybersecurity Analyst',
    company: 'SecureNet',
    location: 'Washington, DC',
    type: 'Full Time',
    salary: '$105k - $145k',
    description: 'Protect our organization from cyber threats by monitoring, detecting, and responding to security incidents. You will implement security measures and conduct risk assessments.',
    postedDate: '2 days ago',
    tags: ['Network Security', 'Incident Response', 'Risk Assessment', 'Compliance'],
    isBookmarked: false
  }
];

export const generateMoreJobs = (count: number) => {
  const jobTitles = [
    'Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer',
    'DevOps Engineer', 'Marketing Specialist', 'Sales Manager', 'Business Analyst',
    'Quality Assurance Engineer', 'Technical Writer', 'Project Manager', 'Scrum Master'
  ];
  
  const companies = [
    'TechFlow', 'DataVision', 'InnovateCorp', 'NextGen Systems', 'CloudTech',
    'Digital Solutions', 'FutureTech', 'SmartSystems', 'TechPioneer', 'Innovation Labs'
  ];
  
  const locations = [
    'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Chicago, IL',
    'Boston, MA', 'Los Angeles, CA', 'Denver, CO', 'Remote', 'Atlanta, GA'
  ];
  
  const jobTypes = ['Full Time', 'Part Time', 'Contract', 'Remote', 'Internship'];
  
  const tags = [
    'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes',
    'Machine Learning', 'SQL', 'MongoDB', 'TypeScript', 'Git', 'Agile', 'Scrum'
  ];

  const additionalJobs = [];
  
  for (let i = 0; i < count; i++) {
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const type = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    
    const minSalary = Math.floor(Math.random() * 100) + 50;
    const maxSalary = minSalary + Math.floor(Math.random() * 50) + 20;
    
    const selectedTags = tags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 2);
    
    additionalJobs.push({
      id: `job-${Date.now()}-${i}`,
      title: jobTitle,
      company: company,
      location: location,
      type: type,
      salary: `$${minSalary}k - $${maxSalary}k`,
      description: `We are looking for a ${jobTitle} to join our team at ${company}. This is an excellent opportunity to work with cutting-edge technologies and make a significant impact on our products and services.`,
      postedDate: `${Math.floor(Math.random() * 7) + 1} day${Math.floor(Math.random() * 7) + 1 > 1 ? 's' : ''} ago`,
      tags: selectedTags,
      isBookmarked: Math.random() > 0.8
    });
  }
  
  return additionalJobs;
};