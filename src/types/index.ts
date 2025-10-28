export interface Project {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    liveUrl: string;
    repositoryUrl: string;
}

export interface Portfolio {
    projects: Project[];
}

export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}