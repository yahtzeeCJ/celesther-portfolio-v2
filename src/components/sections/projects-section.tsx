
"use client";

import ProjectCard from '@/components/project-card';
import ScrollAnimationWrapper from '@/components/scroll-animation-wrapper';
import EditableTextInline from '@/components/editable-text-inline';
import DraggableNativeElement from '@/components/admin/draggable-native-element';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Project } from '@/types/content';

export default function ProjectsSection() {
  const { isAdmin, hasMounted, siteContent, addProject } = useAdmin();

  return (
    <section id="projects" className="py-20 bg-card/50">
      <div className="container mx-auto px-4 relative">
        <ScrollAnimationWrapper className="text-center mb-12 relative min-h-[150px]">
          <DraggableNativeElement id="projectsTitleWrapper_canvas" label="Projects Title" section="projects" defaultX={50} defaultY={0} defaultZ={10}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline inline-block">
              <EditableTextInline contentKey="projectsSectionTitle" as="span">
                {siteContent.projectsSectionTitle}
              </EditableTextInline>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              <EditableTextInline contentKey="projectsSectionDescription" as="span" inputClassName="text-muted-foreground">
                {siteContent.projectsSectionDescription}
              </EditableTextInline>
            </p>
            <div className="w-20 h-1 bg-primary mx-auto mt-4"></div>
          </DraggableNativeElement>
        </ScrollAnimationWrapper>

        {hasMounted && isAdmin && (
          <div className="text-center mb-12">
            <Button onClick={addProject}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </div>
        )}

        <div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 relative"
          style={{ minHeight: `${Math.max(800, Math.ceil(siteContent.projects.length / 2) * 600)}px` }}
        >
          {siteContent.projects.map((project: Project, index: number) => {
            const numRows = Math.ceil(siteContent.projects.length / 2) || 1;
            const yPercent = Math.floor(index / 2) * (100 / numRows);
            return (
            <DraggableNativeElement key={project.id} id={`project_${project.id}_canvas2`} label={`Project: ${project.title}`} section="projects" defaultX={index % 2 === 0 ? 0 : 50} defaultY={yPercent} defaultZ={10}>
              <ProjectCard
                project={project}
              />
            </DraggableNativeElement>
            );
          })}
        </div>
      </div>
    </section>
  );
}
