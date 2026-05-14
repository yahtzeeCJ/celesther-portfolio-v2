// --- Data Structures for Dynamic Content ---
export interface Project {
    id: string;
    key: string;
    title: string;
    description: string;
    bannerUrl?: string;
    tags: string[];
    githubLink?: string;
    liveLink?: string;
    isEnabled: boolean; // For toggling "Coming Soon"
    // For static placeholder visuals
    imagePlaceholderIcon: 'Film' | 'Box' | 'ImageIcon' | 'Folder';
    imageGradient: string;
    dataAiHint: string;
}

export interface Skill {
    id: string;
    name: string;
    level: number; // 0-100
}

export interface SkillCategory {
    id: string;
    title: string;
    description: string;
    icon: 'Film' | 'Box' | 'Laptop'; // To map to Lucide icons
    skills: Skill[];
    transformX?: number;
    transformY?: number;
    scale?: number;
    model3dUrl?: string;
    model3dAutoRotate?: boolean;
    zIndex?: number;
}

export interface TechProficiency {
    id: string;
    name: string;
    icon: 'Film' | 'Video' | 'ImageIcon' | 'Box' | 'Laptop'; // Added Laptop
}

export interface FramerLayer {
    id: string;
    name: string;
    type: 'text' | 'frame' | 'image' | 'video' | 'icon' | 'link' | 'input' | 'button' | 'bg-image' | 'element';
    tag: string;
    children: FramerLayer[];
    // Optional metadata
    src?: string;
    alt?: string;
    href?: string;
    target?: string;
    textContent?: string;
    bgImageUrl?: string;
    inputType?: string;
    placeholder?: string;
}

// --- Visual Design Editor Types ---
export type SectionId = 'hero' | 'about' | 'skills' | 'projects' | 'contact';

export interface CustomTextBlock {
    id: string;
    section: SectionId;
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    color: string;
    x: number;
    y: number;
    scale: number;
    letterSpacing: number;
    lineHeight: number;
    animation: 'none' | 'fadeIn' | 'slideUp' | 'slideLeft' | 'scaleIn';
    animationDuration: number;
    animationDelay: number;
    animationEasing: string;
    strokeColor: string;
    strokeWidth: number;
    fillTransparent: boolean;
    zIndex: number;
}

export interface CustomShape {
    id: string;
    section: SectionId;
    type: 'rectangle' | 'circle' | 'line' | 'triangle';
    fillColor: string;
    fillGradient?: { color1: string; color2: string; direction: string };
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    width: number;
    height: number;
    x: number;
    y: number;
    opacity: number;
    rotation: number;
    zIndex: number;
}

export interface SectionDesign {
    backgroundGradient?: { color1: string; color2: string; direction: string; opacity: number };
    backgroundImage?: { url: string; size: string; position: string; opacity: number; blur: number; blendMode: string };
    customCode?: string;
}

export interface ThemeSettings {
    primaryGradient: { color1: string; color2: string };
    accentGradient: { color1: string; color2: string };
    backgroundGradient: { color1: string; color2: string };
    cardNeutral: string;
    mainText: string;
    bannerTopColor: string;
    bannerBottomColor: string;
    cardBackground: string;
    cardOpacity: number;
    headlineFont: string;
    bodyFont: string;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    primaryGradient: { color1: '#0ea5e9', color2: '#38bdf8' },
    accentGradient: { color1: '#a855f7', color2: '#ec4899' },
    backgroundGradient: { color1: '#121820', color2: '#1e293b' },
    cardNeutral: '#0f172a',
    mainText: '#f8fafc',
    bannerTopColor: '#0ea5e9',
    bannerBottomColor: '#0ea5e9',
    cardBackground: '#0f172a',
    cardOpacity: 0.8,
    headlineFont: 'Poppins',
    bodyFont: 'Poppins',
};

// --- Main Site Content Interface ---
export interface SiteContent {
    // Hero Section
    heroTitle: string;
    heroSubtitle: string;
    heroDescription: string;
    heroProfileImage?: string;

    // About Section
    aboutSectionTitle: string;
    aboutCraftingTitle: string;
    aboutParagraph1: string;
    aboutParagraph2: string;
    aboutMediaSrc?: string;
    aboutMediaType: 'image' | 'video' | null;
    aboutInfoEducationTitle: string;
    aboutInfoEducationValue: string;
    aboutInfoLocationTitle: string;
    aboutInfoLocationValue: string;
    aboutInfoExperienceTitle: string;
    aboutInfoExperienceValue: string;
    aboutInfoProjectsCompletedTitle: string;
    aboutInfoProjectsCompletedValue: string;

    // Skills Section (Now Dynamic)
    skillsSectionTitle: string;
    skillsSectionDescription: string;
    skillsTechProficienciesTitle: string;
    skillCategories: SkillCategory[];
    techProficiencies: TechProficiency[];

    // Projects Section (Now Dynamic)
    projectsSectionTitle: string;
    projectsSectionDescription: string;
    projects: Project[];

    // Contact Section
    contactSectionTitle: string;
    contactSectionDescription: string;
    contactInfoTitle: string;
    contactInfoEmailTitle: string;
    contactInfoEmailValue: string;
    contactInfoCallTitle: string;
    contactInfoCallValue: string;
    contactInfoLocationTitle: string;
    contactInfoLocationValue: string;
    contactFollowMeTitle: string;
    contactFormNameLabel: string;
    contactFormEmailLabel: string;
    contactFormSubjectLabel: string;
    contactFormMessageLabel: string;
    contactSocialLinkedinAriaLabel: string;
    contactSocialGithubAriaLabel: string;
    contactSocialDiscordAriaLabel: string;

    // Footer
    footerLogoTextLine1: string;
    footerLogoTextLine2: string;
    footerTagline: string;
    footerSocialLinkedinAriaLabel: string;
    footerSocialGithubAriaLabel: string;
    footerSocialDiscordAriaLabel: string;
    footerBackToTopText: string;
    footerCopyrightTextPart1: string;
    footerCopyrightTextPart2: string;

    projectMediaUrls: { [projectKey: string]: string[] };

    // Visual Design Editor data
    customTextBlocks: CustomTextBlock[];
    customShapes: CustomShape[];
    sectionDesigns: Record<string, SectionDesign>;
    elementTransforms: Record<string, { x: number; y: number; scale: number; zIndex: number; label: string; section: SectionId }>;
    themeSettings: ThemeSettings;
    framerTextEdits: Record<string, string>;
    framerEdits: Record<string, Record<string, string>>;

    // Advanced Framer Editor data
    framerTextStyles: Record<string, FramerTextStyle>;
    framerSectionBackgrounds: Record<string, FramerSectionBackground>;
    framerSectionGradients: Record<string, FramerSectionGradient>;
    framerTheme: FramerTheme;
    framerCustomSections: FramerCustomSection[];
    framerHiddenSections: string[];
}

export interface FramerTextStyle {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    animation?: string;
    animationDuration?: number;
    animationDelay?: number;
    animationIterations?: string;
}

export interface FramerSectionBackground {
    type: 'image' | 'video' | 'code' | 'none';
    url?: string;
    code?: string;
    opacity?: number;
    blur?: number;
    blendMode?: string;
    size?: string;
    position?: string;
    videoAutoplay?: boolean;
    videoLoop?: boolean;
    videoMuted?: boolean;
    animation?: string;
    animationDuration?: number;
}

export interface FramerSectionGradient {
    enabled: boolean;
    color1: string;
    color2: string;
    color3?: string;
    direction: string;
    type: 'linear' | 'radial';
    opacity: number;
}

export interface FramerTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    preset: string;
    hueRotate?: string;
}

export interface FramerCustomSection {
    id: string;
    name: string;
    insertAfter: string;
    height: number;
    backgroundColor: string;
    content: string;
    visible: boolean;
}

export const DEFAULT_CONTENT: SiteContent = {
    // Hero Section
    heroTitle: "Hi, I'm Celesther John Lutche",
    heroSubtitle: "Passion-driven Editor, 3D artistry",
    heroDescription: "Welcome to my portfolio! I'm Celesther 😎 Explore my work and see how I can bring your vision to life.",
    heroProfileImage: "https://placehold.co/320x320.png",

    // About Section
    aboutSectionTitle: "About Me",
    aboutCraftingTitle: "Crafting Digital Experiences",
    aboutParagraph1: "I'm an undergraduate student at University of Mindanao studying Civil Engineering 🦺.",
    aboutParagraph2: "From a young age, I was fascinated by the power of visual storytelling. This passion led me to pursue a career in video editing, where I've honed my skills over 4 years. With a background in long and short films and 3D associated videos.",
    aboutMediaSrc: "https://placehold.co/600x800.png",
    aboutMediaType: 'image',
    aboutInfoEducationTitle: 'Education',
    aboutInfoEducationValue: 'Civil Engineering (Undergrad)',
    aboutInfoLocationTitle: 'Location',
    aboutInfoLocationValue: 'Davao City, PH',
    aboutInfoExperienceTitle: 'Experience',
    aboutInfoExperienceValue: '5+ Years',
    aboutInfoProjectsCompletedTitle: 'Projects',
    aboutInfoProjectsCompletedValue: '15+ Completed',

    // Skills Section
    skillsSectionTitle: "My Skills",
    skillsSectionDescription: "I've developed expertise in a diverse range of technologies and design tools to build complete solutions.",
    skillCategories: [
        {
            id: 'skill-cat-1', title: 'Editing', description: 'Creating and refining digital content with focus on visual design, layout composition, and clear communication through various media formats.', icon: 'Film', skills: [
                { id: 'skill-1-1', name: 'Premiere Pro', level: 90 },
                { id: 'skill-1-2', name: 'After Effects', level: 85 },
                { id: 'skill-1-3', name: 'Photoshop', level: 95 },
            ]
        },
        {
            id: 'skill-cat-2', title: '3D', description: 'Creating immersive 3D experiences, from modeling and animation to interactive web-based visualizations using modern rendering technologies.', icon: 'Box', skills: [
                { id: 'skill-2-1', name: 'Modeling', level: 75 },
                { id: 'skill-2-2', name: 'Environment', level: 80 },
                { id: 'skill-2-3', name: 'Buildings', level: 80 },
            ]
        },
        {
            id: 'skill-cat-3', title: 'Developing Skills', description: 'Building comprehensive technical expertise across multiple domains, continuously expanding proficiency in emerging technologies and development methodologies.', icon: 'Laptop', skills: [
                { id: 'skill-3-1', name: 'Coding (Web Development)', level: 65 },
                { id: 'skill-3-2', name: '3D Animation', level: 60 },
                { id: 'skill-3-3', name: 'Motion Graphics', level: 70 },
            ]
        },
    ],
    skillsTechProficienciesTitle: 'Technical Proficiencies',
    techProficiencies: [
        { id: 'tech-1', name: 'After Effects', icon: 'Film' },
        { id: 'tech-2', name: 'Premiere Pro', icon: 'Video' },
        { id: 'tech-3', name: 'Photoshop', icon: 'ImageIcon' },
        { id: 'tech-4', name: 'Blender', icon: 'Box' },
        { id: 'tech-5', name: 'Capcut', icon: 'Film' },
        { id: 'tech-6', name: 'Opus', icon: 'Film' },
    ],

    // Projects Section
    projectsSectionTitle: "Featured Projects",
    projectsSectionDescription: "Here are some of my recent projects that showcase my skills and expertise.",
    projects: [
        { id: 'proj-1', key: 'project1', title: 'Video Edits', description: 'Comprehensive video production project featuring motion graphics, seamless transitions, and professional post-production workflow from concept to final output using industry-standard editing software.', bannerUrl: undefined, tags: ['After Effects', 'Premiere Pro', 'Capcut'], githubLink: '#', liveLink: '#', isEnabled: true, imagePlaceholderIcon: 'Film', imageGradient: "from-primary to-blue-400", dataAiHint: "video editing interface" },
        { id: 'proj-2', key: 'project2', title: '3D', description: 'Interactive three-dimensional modeling project demonstrating spatial design, realistic rendering, and immersive visual experience development.', bannerUrl: undefined, tags: ['Animation', 'Buildings', 'Environment'], githubLink: '#', liveLink: '#', isEnabled: true, imagePlaceholderIcon: 'Box', imageGradient: "from-purple-500 to-pink-500", dataAiHint: "3d model render" },
        { id: 'proj-3', key: 'project3', title: 'Photo Edits', description: 'Experties in photo retouching and enhancement project showcasing advanced editing techniques, color correction, and digital image manipulation skills.', bannerUrl: undefined, tags: ['Photoshop'], githubLink: '#', liveLink: '#', isEnabled: true, imagePlaceholderIcon: 'ImageIcon', imageGradient: "from-green-500 to-teal-500", dataAiHint: "photo editing software" },
        { id: 'proj-4', key: 'project4', title: 'Other Projects', description: "This is for my unfinished projects, currently developing my skills here. I have not compiled all of them yet.", bannerUrl: undefined, tags: ['Coding', 'Motion Graphics', 'Others'], githubLink: '#', liveLink: '#', isEnabled: false, imagePlaceholderIcon: 'Folder', imageGradient: "from-yellow-600 to-orange-500", dataAiHint: "code abstract" },
    ],

    // Contact Section
    contactSectionTitle: "Get In Touch",
    contactSectionDescription: "Have a project in mind or want to discuss potential opportunities? I'd love to hear from you!",
    contactInfoTitle: "Contact Information",
    contactInfoEmailTitle: 'Email Me',
    contactInfoEmailValue: 'cjvalo21@gmail.com',
    contactInfoCallTitle: 'Call Me',
    contactInfoCallValue: '+63 9276452027',
    contactInfoLocationTitle: 'Location',
    contactInfoLocationValue: 'Davao city, Philippines',
    contactFollowMeTitle: "Follow Me",
    contactFormNameLabel: "Your Name",
    contactFormEmailLabel: "Email Address",
    contactFormSubjectLabel: "Subject",
    contactFormMessageLabel: "Your Message",
    contactSocialLinkedinAriaLabel: "LinkedIn",
    contactSocialGithubAriaLabel: "GitHub",
    contactSocialDiscordAriaLabel: "Discord",

    // Footer
    footerLogoTextLine1: "Celesther John",
    footerLogoTextLine2: "Lutche",
    footerTagline: "YahtzeeCJ 🎧",
    footerSocialLinkedinAriaLabel: "LinkedIn",
    footerSocialGithubAriaLabel: "GitHub",
    footerSocialDiscordAriaLabel: "Discord",
    footerBackToTopText: "Back to Top",
    footerCopyrightTextPart1: " Celesther John Lutche.",
    footerCopyrightTextPart2: "All rights reserved.",

    projectMediaUrls: { project1: [], project2: [], project3: [], project4: [] },

    // Visual Design Editor defaults
    customTextBlocks: [],
    customShapes: [],
    sectionDesigns: {},
    elementTransforms: {},
    themeSettings: DEFAULT_THEME_SETTINGS,
    framerTextEdits: {},
    framerEdits: {},
    framerTextStyles: {},
    framerSectionBackgrounds: {},
    framerSectionGradients: {},
    framerTheme: { primaryColor: '#0ea5e9', secondaryColor: '#06b6d4', accentColor: '#0891b2', preset: 'ocean' },
    framerCustomSections: [],
    framerHiddenSections: [],
};
