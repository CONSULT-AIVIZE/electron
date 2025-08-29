import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface Project {
  id: string
  name: string
  description: string
  type: 'consultation' | 'research' | 'development' | 'analysis'
  status: 'active' | 'paused' | 'completed' | 'archived'
  createdAt: Date
  updatedAt: Date
  metadata: {
    tags: string[]
    priority: 'low' | 'medium' | 'high'
    estimatedHours?: number
    actualHours?: number
    dueDate?: Date
    collaborators?: string[]
    notes?: string
  }
  settings: {
    aiModel?: string
    temperature?: number
    maxTokens?: number
    tools?: string[]
  }
  resources: {
    files: string[]
    links: string[]
    references: string[]
  }
}

interface ProjectState {
  projects: Project[]
  currentProjectId: string | null
  isLoading: boolean
  
  // Actions
  createProject: (data: Partial<Project>) => string
  updateProject: (projectId: string, updates: Partial<Project>) => void
  deleteProject: (projectId: string) => void
  duplicateProject: (projectId: string) => string | null
  archiveProject: (projectId: string) => void
  restoreProject: (projectId: string) => void
  
  // Project switching
  switchToProject: (projectId: string) => void
  getCurrentProject: () => Project | null
  getProjectById: (projectId: string) => Project | null
  
  // Search and filtering
  searchProjects: (query: string) => Project[]
  getProjectsByStatus: (status: Project['status']) => Project[]
  getProjectsByType: (type: Project['type']) => Project[]
  
  // Project management
  updateProjectProgress: (projectId: string, hoursWorked: number) => void
  addProjectResource: (projectId: string, type: keyof Project['resources'], resource: string) => void
  removeProjectResource: (projectId: string, type: keyof Project['resources'], resource: string) => void
  
  // Bulk operations
  exportProject: (projectId: string) => string | null
  importProject: (projectData: string) => boolean
  exportAllProjects: () => string
  
  // Statistics
  getProjectStats: () => {
    total: number
    active: number
    completed: number
    totalHours: number
    avgCompletionTime: number
  }
}

const createDefaultProject = (data: Partial<Project> = {}): Omit<Project, 'id'> => ({
  name: 'New Project',
  description: '',
  type: 'consultation',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {
    tags: [],
    priority: 'medium',
    notes: '',
    ...data.metadata,
  },
  settings: {
    aiModel: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000,
    tools: [],
    ...data.settings,
  },
  resources: {
    files: [],
    links: [],
    references: [],
    ...data.resources,
  },
  ...data,
})

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      isLoading: false,
      
      createProject: (data) => {
        const projectId = nanoid()
        const newProject: Project = {
          id: projectId,
          ...createDefaultProject(data),
        }
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: projectId,
        }))
        
        return projectId
      },
      
      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  ...updates,
                  updatedAt: new Date(),
                  metadata: updates.metadata 
                    ? { ...project.metadata, ...updates.metadata }
                    : project.metadata,
                  settings: updates.settings
                    ? { ...project.settings, ...updates.settings }
                    : project.settings,
                  resources: updates.resources
                    ? { ...project.resources, ...updates.resources }
                    : project.resources,
                }
              : project
          ),
        }))
      },
      
      deleteProject: (projectId) => {
        set((state) => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId,
        }))
      },
      
      duplicateProject: (projectId) => {
        const originalProject = get().getProjectById(projectId)
        if (!originalProject) return null
        
        const duplicatedProject = {
          ...originalProject,
          name: `${originalProject.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        return get().createProject(duplicatedProject)
      },
      
      archiveProject: (projectId) => {
        get().updateProject(projectId, { 
          status: 'archived',
          updatedAt: new Date() 
        })
      },
      
      restoreProject: (projectId) => {
        get().updateProject(projectId, { 
          status: 'active',
          updatedAt: new Date() 
        })
      },
      
      switchToProject: (projectId) => {
        const project = get().getProjectById(projectId)
        if (project) {
          set({ currentProjectId: projectId })
        }
      },
      
      getCurrentProject: () => {
        const { projects, currentProjectId } = get()
        return projects.find(p => p.id === currentProjectId) || null
      },
      
      getProjectById: (projectId) => {
        return get().projects.find(p => p.id === projectId) || null
      },
      
      searchProjects: (query) => {
        const { projects } = get()
        const lowerQuery = query.toLowerCase()
        
        return projects.filter(project =>
          project.name.toLowerCase().includes(lowerQuery) ||
          project.description.toLowerCase().includes(lowerQuery) ||
          project.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          (project.metadata.notes && project.metadata.notes.toLowerCase().includes(lowerQuery))
        )
      },
      
      getProjectsByStatus: (status) => {
        return get().projects.filter(p => p.status === status)
      },
      
      getProjectsByType: (type) => {
        return get().projects.filter(p => p.type === type)
      },
      
      updateProjectProgress: (projectId, hoursWorked) => {
        const project = get().getProjectById(projectId)
        if (project) {
          const currentHours = project.metadata.actualHours || 0
          get().updateProject(projectId, {
            metadata: {
              ...project.metadata,
              actualHours: currentHours + hoursWorked,
            },
          })
        }
      },
      
      addProjectResource: (projectId, type, resource) => {
        const project = get().getProjectById(projectId)
        if (project && !project.resources[type].includes(resource)) {
          get().updateProject(projectId, {
            resources: {
              ...project.resources,
              [type]: [...project.resources[type], resource],
            },
          })
        }
      },
      
      removeProjectResource: (projectId, type, resource) => {
        const project = get().getProjectById(projectId)
        if (project) {
          get().updateProject(projectId, {
            resources: {
              ...project.resources,
              [type]: project.resources[type].filter(r => r !== resource),
            },
          })
        }
      },
      
      exportProject: (projectId) => {
        const project = get().getProjectById(projectId)
        if (!project) return null
        
        return JSON.stringify(project, null, 2)
      },
      
      importProject: (projectData) => {
        try {
          const project = JSON.parse(projectData) as Project
          
          // Generate new ID to avoid conflicts
          const projectId = nanoid()
          const importedProject = {
            ...project,
            id: projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
          
          set((state) => ({
            projects: [...state.projects, importedProject],
          }))
          
          return true
        } catch (error) {
          console.error('Failed to import project:', error)
          return false
        }
      },
      
      exportAllProjects: () => {
        const { projects } = get()
        return JSON.stringify(projects, null, 2)
      },
      
      getProjectStats: () => {
        const { projects } = get()
        
        const stats = {
          total: projects.length,
          active: projects.filter(p => p.status === 'active').length,
          completed: projects.filter(p => p.status === 'completed').length,
          totalHours: projects.reduce((total, project) => 
            total + (project.metadata.actualHours || 0), 0),
          avgCompletionTime: 0,
        }
        
        const completedProjects = projects.filter(p => p.status === 'completed')
        if (completedProjects.length > 0) {
          const totalCompletionTime = completedProjects.reduce((total, project) => {
            const timeDiff = new Date(project.updatedAt).getTime() - new Date(project.createdAt).getTime()
            return total + (timeDiff / (1000 * 60 * 60 * 24)) // Convert to days
          }, 0)
          stats.avgCompletionTime = totalCompletionTime / completedProjects.length
        }
        
        return stats
      },
    }),
    {
      name: 'triangle-os-projects',
      version: 1,
    }
  )
)