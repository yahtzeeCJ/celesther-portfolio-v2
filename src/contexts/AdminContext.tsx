
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

import { SiteContent, DEFAULT_CONTENT, Project, SkillCategory, TechProficiency, SectionId, CustomTextBlock, CustomShape, SectionDesign } from '@/types/content';
import { saveSiteContent } from '@/app/actions';

// --- Admin Context Type ---
interface AdminContextType {
  isAdmin: boolean;
  hasMounted: boolean;
  siteContent: SiteContent;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateSiteContent: (key: keyof SiteContent, value: SiteContent[keyof SiteContent]) => void;
  updateProjectMediaUrls: (projectKey: string, newUrls: string[]) => void;
  saveChanges: () => Promise<void>;
  recoverFromLocalStorage: () => void;
  updateProject: (projectId: string, updatedProject: Partial<Project>) => void;
  addProject: () => void;
  deleteProject: (projectId: string) => void;
  updateSkillCategory: (categoryId: string, updatedCategory: Partial<SkillCategory>) => void;
  addSkillCategory: () => void;
  deleteSkillCategory: (categoryId: string) => void;
  updateTechProficiency: (proficiencyId: string, updatedProficiency: Partial<TechProficiency>) => void;
  addTechProficiency: () => void;
  deleteTechProficiency: (proficiencyId: string) => void;
  // Visual Design Editor
  selectedSection: SectionId | null;
  setSelectedSection: (section: SectionId | null) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  addCustomTextBlock: (section: SectionId) => void;
  updateCustomTextBlock: (id: string, updates: Partial<CustomTextBlock>) => void;
  deleteCustomTextBlock: (id: string) => void;
  addCustomShape: (section: SectionId) => void;
  updateCustomShape: (id: string, updates: Partial<CustomShape>) => void;
  deleteCustomShape: (id: string) => void;
  updateSectionDesign: (section: SectionId, design: Partial<SectionDesign>) => void;
  updateElementTransform: (id: string, updates: Partial<{ x: number; y: number; scale: number; zIndex: number; label: string; section: SectionId }>) => void;
  // History
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// --- Default Content ---
// --- Default Content Removed (Imported) ---

// --- Local Storage and Admin Session Keys ---
const ADMIN_SESSION_KEY = 'celestherIsAdmin_v2'; // Kept for session persistence

// --- Admin Provider Component ---
export function AdminProvider({ children, initialContent }: { children: ReactNode; initialContent?: SiteContent }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [siteContent, setSiteContent] = useState<SiteContent>(initialContent || DEFAULT_CONTENT);
  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [pastState, setPastState] = useState<SiteContent[]>([]);
  const [futureState, setFutureState] = useState<SiteContent[]>([]);
  const { toast } = useToast();

  // ===== CRITICAL FIX: Ref that always holds the latest siteContent =====
  // React state closures can be stale. This ref is ALWAYS current.
  const siteContentRef = useRef<SiteContent>(siteContent);
  useEffect(() => {
    siteContentRef.current = siteContent;
  }, [siteContent]);

  const commitHistory = useCallback(() => {
    setPastState(prev => {
      const newPast = [...prev, siteContentRef.current];
      if (newPast.length > 50) newPast.shift();
      return newPast;
    });
    setFutureState([]);
  }, []);

  const undo = useCallback(() => {
    setPastState(prev => {
      if (prev.length === 0) return prev;
      const previousState = prev[prev.length - 1];
      setFutureState(fut => [siteContentRef.current, ...fut]);
      setSiteContent(previousState);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFutureState(prev => {
      if (prev.length === 0) return prev;
      const nextState = prev[0];
      setPastState(past => [...past, siteContentRef.current]);
      setSiteContent(nextState);
      return prev.slice(1);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAdmin) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Do not intercept if user is typing inside an input
        return;
      }
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, undo, redo]);

  useEffect(() => {
    // Auto-save to local storage whenever siteContent changes and we are an admin
    if (isAdmin && hasMounted) {
      try {
        localStorage.setItem('celestherAdminContent_v6_dynamic', JSON.stringify(siteContent));
      } catch (error) {
        console.error("Failed to auto-save to local storage", error);
      }
    }
  }, [siteContent, isAdmin, hasMounted]);

  useEffect(() => {
    // This effect runs only on the client
    setHasMounted(true);
    const storedAdminStatus = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (storedAdminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (username === 'yahtzeeCJ' && password === 'cjlutche1287') {
      setIsAdmin(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const updateSiteContent = useCallback((key: keyof SiteContent, value: SiteContent[keyof SiteContent]) => {
    commitHistory();
    setSiteContent(prevContent => ({ ...prevContent, [key]: value }));
  }, [commitHistory]);

  const updateProjectMediaUrls = (projectKey: string, newUrls: string[]) => {
    setSiteContent(prevContent => ({
      ...prevContent,
      projectMediaUrls: {
        ...(prevContent.projectMediaUrls || {}),
        [projectKey]: newUrls,
      },
    }));
  };

  // ===== CRITICAL FIX: saveChanges reads from ref, not stale closure =====
  const saveChanges = useCallback(async () => {
    if (!isAdmin) return;
    try {
      // Read the LATEST state from ref, not from the potentially stale closure
      const latestContent = siteContentRef.current;
      console.log('[AdminContext] saveChanges called. framerTextEdits keys:', Object.keys(latestContent.framerTextEdits || {}));
      toast({ title: "Saving...", description: "Updating site content to the cloud." });
      const result = await saveSiteContent(latestContent);
      if (result.success) {
        toast({ title: "Changes Saved ✅", description: "All updates saved to cloud storage." });
      } else {
        console.error('[AdminContext] Save failed:', result.error);
        toast({ variant: "destructive", title: "Save Error", description: result.error || "Could not save changes." });
      }
    } catch (error) {
      console.error("[AdminContext] Failed to save site content to Cloud", error);
      toast({ variant: "destructive", title: "Save Error", description: "Could not save changes." });
    }
  }, [isAdmin, toast]);

  const recoverFromLocalStorage = () => {
    const storedContent = localStorage.getItem('celestherAdminContent_v6_dynamic');
    if (storedContent) {
      try {
        const parsedContent = JSON.parse(storedContent) as Partial<SiteContent>;
        const mergedContent: SiteContent = {
          ...DEFAULT_CONTENT,
          ...parsedContent,
          skillCategories: parsedContent.skillCategories || DEFAULT_CONTENT.skillCategories,
          projects: parsedContent.projects || DEFAULT_CONTENT.projects,
          techProficiencies: parsedContent.techProficiencies || DEFAULT_CONTENT.techProficiencies,
        };
        setSiteContent(mergedContent);
        toast({ title: "Local Data Recovered", description: "Found data from your browser. Click 'Save' to upload it to the cloud." });
      } catch (error) {
        console.error("Failed to parse local storage", error);
        toast({ variant: "destructive", title: "Recovery Failed", description: "Could not read local data." });
      }
    } else {
      toast({ title: "No Local Data", description: "No saved data found in this browser." });
    }
  };

  // --- New Dynamic Content Handlers ---

  const updateProject = (projectId: string, updatedProject: Partial<Project>) => {
    setSiteContent(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectId ? { ...p, ...updatedProject } : p),
    }));
  };

  const addProject = () => {
    const newId = `proj-${Date.now()}`;
    const newKey = `project${Date.now()}`;
    const newProject: Project = {
      id: newId,
      key: newKey,
      title: 'New Project',
      description: 'A brief description of this new project.',
      tags: ['New Tag'],
      isEnabled: true,
      imagePlaceholderIcon: 'ImageIcon',
      imageGradient: 'from-gray-500 to-gray-600',
      dataAiHint: 'project abstract',
    };
    setSiteContent(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
      projectMediaUrls: {
        ...prev.projectMediaUrls,
        [newKey]: [],
      }
    }));
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      setSiteContent(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== projectId),
      }));
    }
  };

  const updateSkillCategory = (categoryId: string, updatedCategory: Partial<SkillCategory>) => {
    setSiteContent(prev => ({
      ...prev,
      skillCategories: prev.skillCategories.map(sc => sc.id === categoryId ? { ...sc, ...updatedCategory } : sc),
    }));
  };

  const addSkillCategory = () => {
    const newId = `skill-cat-${Date.now()}`;
    const newCategory: SkillCategory = {
      id: newId,
      title: 'New Skill Area',
      description: 'Description of this skill area.',
      icon: 'Laptop',
      skills: [{ id: `new-skill-${Date.now()}`, name: 'New Skill', level: 50 }],
    };
    setSiteContent(prev => ({
      ...prev,
      skillCategories: [...prev.skillCategories, newCategory],
    }));
  };

  const deleteSkillCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this skill category?')) {
      setSiteContent(prev => ({
        ...prev,
        skillCategories: prev.skillCategories.filter(sc => sc.id !== categoryId),
      }));
    }
  };

  const updateTechProficiency = (proficiencyId: string, updatedProficiency: Partial<TechProficiency>) => {
    setSiteContent(prev => ({
      ...prev,
      techProficiencies: prev.techProficiencies.map(tp => tp.id === proficiencyId ? { ...tp, ...updatedProficiency } : tp),
    }));
  };

  const addTechProficiency = () => {
    const newId = `tech-${Date.now()}`;
    const newProficiency: TechProficiency = {
      id: newId,
      name: 'New Tech',
      icon: 'Laptop',
    };
    setSiteContent(prev => ({
      ...prev,
      techProficiencies: [...prev.techProficiencies, newProficiency],
    }));
  };

  const deleteTechProficiency = (proficiencyId: string) => {
    setSiteContent(prev => ({
      ...prev,
      techProficiencies: prev.techProficiencies.filter(tp => tp.id !== proficiencyId),
    }));
  };

  // --- Visual Design Editor Handlers ---
  const addCustomTextBlock = (section: SectionId) => {
    const newBlock: CustomTextBlock = {
      id: `text-${Date.now()}`,
      section,
      content: 'New Text',
      fontFamily: 'Poppins',
      fontSize: 24,
      fontWeight: '400',
      color: '#ffffff',
      x: 50,
      y: 50,
      scale: 1,
      letterSpacing: 0,
      lineHeight: 1.4,
      animation: 'none',
      animationDuration: 0.6,
      animationDelay: 0,
      animationEasing: 'ease-out',
      strokeColor: '#ffffff',
      strokeWidth: 0,
      fillTransparent: false,
      zIndex: 10,
    };
    setSiteContent(prev => ({
      ...prev,
      customTextBlocks: [...(prev.customTextBlocks || []), newBlock],
    }));
  };

  const updateCustomTextBlock = (id: string, updates: Partial<CustomTextBlock>) => {
    setSiteContent(prev => ({
      ...prev,
      customTextBlocks: (prev.customTextBlocks || []).map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  };

  const deleteCustomTextBlock = (id: string) => {
    setSiteContent(prev => ({
      ...prev,
      customTextBlocks: (prev.customTextBlocks || []).filter(b => b.id !== id),
    }));
  };

  const addCustomShape = (section: SectionId) => {
    const newShape: CustomShape = {
      id: `shape-${Date.now()}`,
      section,
      type: 'rectangle',
      fillColor: '#0ea5e9',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 8,
      width: 100,
      height: 100,
      x: 50,
      y: 50,
      opacity: 1,
      rotation: 0,
      zIndex: 5,
    };
    setSiteContent(prev => ({
      ...prev,
      customShapes: [...(prev.customShapes || []), newShape],
    }));
  };

  const updateCustomShape = (id: string, updates: Partial<CustomShape>) => {
    setSiteContent(prev => ({
      ...prev,
      customShapes: (prev.customShapes || []).map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  };

  const deleteCustomShape = (id: string) => {
    setSiteContent(prev => ({
      ...prev,
      customShapes: (prev.customShapes || []).filter(s => s.id !== id),
    }));
  };

  const updateSectionDesign = (section: SectionId, design: Partial<SectionDesign>) => {
    setSiteContent(prev => ({
      ...prev,
      sectionDesigns: {
        ...(prev.sectionDesigns || {}),
        [section]: { ...(prev.sectionDesigns?.[section] || {}), ...design },
      },
    }));
  };

  const updateElementTransform = (id: string, updates: Partial<{ x: number; y: number; scale: number; zIndex: number; label: string; section: SectionId }>) => {
    setSiteContent(prev => ({
      ...prev,
      elementTransforms: {
        ...(prev.elementTransforms || {}),
        [id]: Object.assign(
          { x: 50, y: 50, scale: 1, zIndex: 10, label: id, section: selectedSection || 'hero' },
          prev.elementTransforms?.[id] || {},
          updates
        )
      }
    }));
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      hasMounted,
      siteContent,
      login,
      logout,
      updateSiteContent,
      updateProjectMediaUrls,
      saveChanges,
      recoverFromLocalStorage,
      updateProject,
      addProject,
      deleteProject,
      updateSkillCategory,
      addSkillCategory,
      deleteSkillCategory,
      updateTechProficiency,
      addTechProficiency,
      deleteTechProficiency,
      selectedSection,
      setSelectedSection,
      selectedLayerId,
      setSelectedLayerId,
      addCustomTextBlock,
      updateCustomTextBlock,
      deleteCustomTextBlock,
      addCustomShape,
      updateCustomShape,
      deleteCustomShape,
      updateSectionDesign,
      updateElementTransform,
      commitHistory,
      undo,
      redo,
      canUndo: pastState.length > 0,
      canRedo: futureState.length > 0,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
