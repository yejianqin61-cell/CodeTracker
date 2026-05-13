import { fetchJson } from './http'

export type ProjectDto = { id: number; name: string; created_at: string }

export type ProjectsListDto = { items: ProjectDto[] }

export function listProjects(): Promise<ProjectsListDto> {
  return fetchJson<ProjectsListDto>('GET', '/api/projects')
}

export function createProject(body: { name: string }): Promise<{ id: number }> {
  return fetchJson<{ id: number }>('POST', '/api/projects', { json: body })
}
