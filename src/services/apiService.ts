import axios, { AxiosError } from 'axios'; // Import axios and AxiosError

// --- Interfaces ---

// Represents a single line within the script data structure
export interface ScriptLine {
    character: string;
    dialogue: string;
}

// Represents the full script snippet data returned by the API
export interface ScriptSnip {
    id: string;
    title?: string | null; // Allow null if DB allows
    characters: string[];
    lines: ScriptLine[];
    createdAt: string;
    updatedAt: string;
}

// Represents the structure for creating or updating a script
// (Used as payload for POST/PUT and in forms)
export interface ScriptFormData {
    title?: string; // Optional title
    characters: string[];
    lines: ScriptLine[]; // Use the existing ScriptLine interface
}

// Represents pagination info returned by the API
export interface PaginationInfo {
    totalScripts: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    sortBy?: 'title' | 'createdAt'; // Use specific types
    sortOrder?: 'asc' | 'desc';
}

// Represents the structure of the response for fetching multiple scripts
export interface PaginatedScriptsResponse {
    data: ScriptSnip[];
    pagination: PaginationInfo;
}

// --- Axios Instance ---
const apiClient = axios.create({
    // Use the environment variable defined in .env and Vite's import.meta.env
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api', // Fallback for safety, but should be set
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Error Handling Helper ---
function formatError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }
        return axiosError.message || axiosError.response?.statusText || 'An unknown API error occurred';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}


// --- API Functions ---

/**
 * Fetches a list of scripts with pagination, search, and sorting.
 */
export async function getAllScripts(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy?: string, // Add sortBy parameter
    sortOrder?: 'asc' | 'desc' // Add sortOrder parameter
): Promise<PaginatedScriptsResponse> {
    try {
        const params = new URLSearchParams({ // Use URLSearchParams for cleaner param handling
            page: String(page),
            limit: String(limit),
        });
        if (search) {
            params.append('search', search);
        }
        // Append sort parameters if provided
        if (sortBy) {
            params.append('sortBy', sortBy);
        }
        if (sortOrder) {
            params.append('sortOrder', sortOrder);
        }

        const response = await apiClient.get<PaginatedScriptsResponse>('/scripts', { params });
        return response.data;
    } catch (error) {
        throw new Error(formatError(error));
    }
}

/**
 * Fetches a single script by its ID.
 */
export async function getScriptById(id: string): Promise<ScriptSnip> {
     try {
        const response = await apiClient.get<ScriptSnip>(`/scripts/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(formatError(error));
    }
}

/**
 * Fetches a random script.
 */
export async function getRandomScript(): Promise<ScriptSnip> {
    try {
        const response = await apiClient.get<ScriptSnip>('/scripts/random', {
             params: { t: Date.now() }
        });
        return response.data;
    } catch (error) {
        throw new Error(formatError(error));
    }
}

/**
 * Fetches a specified number of random scripts, optionally excluding specific IDs.
 * @param count The number of random scripts to fetch.
 * @param excludeIds An optional array of script IDs to exclude from the results.
 */
export async function getRandomScripts(count: number, excludeIds?: string[]): Promise<ScriptSnip[]> {
    try {
        // Use URLSearchParams for cleaner parameter handling
        const params = new URLSearchParams({
            count: String(count),
        });

        // Add excludeIds if provided and not empty
        if (excludeIds && excludeIds.length > 0) {
            params.append('excludeIds', excludeIds.join(','));
        }

        // Make the GET request with the parameters
        const response = await apiClient.get<ScriptSnip[]>('/scripts/random-multiple', { params });
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch ${count} random scripts (excluding ${excludeIds?.length || 0} IDs):`, formatError(error));
        throw new Error(formatError(error)); // Re-throw formatted error
    }
}

/**
 * Fetches multiple scripts by their IDs using the batch endpoint.
 */
export async function getScriptsByIds(ids: string[]): Promise<ScriptSnip[]> {
    if (!ids || ids.length === 0) {
        return Promise.resolve([]); // Return empty array immediately if no IDs
    }
    try {
        const params = new URLSearchParams({
            ids: ids.join(','), // Join IDs into a comma-separated string
        });
        const response = await apiClient.get<ScriptSnip[]>('/scripts/batch', { params });
        return response.data;
    } catch (error) {
        throw new Error(formatError(error));
    }
}


/**
 * Creates a new script snippet.
 * Uses the ScriptFormData interface for the payload.
 */
export async function createScript(scriptData: ScriptFormData): Promise<ScriptSnip> {
     try {
        const response = await apiClient.post<ScriptSnip>('/scripts', scriptData);
        return response.data;
    } catch (error) {
        console.error("Failed to create script:", formatError(error));
        throw new Error(formatError(error));
    }
}

/**
 * Updates an existing script snippet.
 * Uses the ScriptFormData interface for the payload.
 */
export async function updateScript(id: string, scriptData: ScriptFormData): Promise<ScriptSnip> {
    try {
        // Ensure only expected fields are sent if necessary,
        // though backend validation should handle extras.
        const payload: ScriptFormData = {
            title: scriptData.title,
            characters: scriptData.characters,
            lines: scriptData.lines
        };
        const response = await apiClient.put<ScriptSnip>(`/scripts/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Failed to update script ${id}:`, formatError(error));
        throw new Error(formatError(error));
    }
}

/**
 * Deletes a script snip by its ID.
 */
export async function deleteScript(id: string): Promise<void> {
    try {
        await apiClient.delete(`/scripts/${id}`);
    } catch (error) {
        throw new Error(formatError(error));
    }
}