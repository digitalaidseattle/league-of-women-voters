/**
 * Institution AI Service
 * This service interacts with the AI backend to generate content related to institutions.
 * It uses the Firebase AI SDK to create a generative model that can respond to prompts
 * about institutions, such as listing philanthropic organizations in a specific area.  
 * 
 * Provision Firebase application  in Google Cloud
 * <ol>
 * <li>Go to the Google Cloud Console.</li>
 * <li>Select an existing project.</li>
 * <li>Navigate to the "APIs & Services" page.</li>
 * <li>Click on "Credential".</li>
 * <li>Edit API (the key should match the API key in the .env file).</li>
 * <li>Enable the "Generative Language API" and "Firebase AI Logic API" restrictions.</li>
 * </ol>
 */

import { AI, getAI, getGenerativeModel, GoogleAIBackend, Part } from "firebase/ai";
import { getConfiguration } from "./FirebaseConfiguration";

export type ProjectOutput = {
    name: string;
    maxWords?: number;
    unit?: 'words' | 'characters';
}

export type ProjectContext = {
    type: string;
    name: string | null;
    value: string | null;
    tokenCount: number;
    file?: File;
    fileUrl?: string;
}

export type Project = {
    name: string;
    rating: number;
    tags: string[];
    template: string;
    prompt: string;
    contexts: ProjectContext[];
    outputs: ProjectOutput[];
    tokenCount: number;
    modelType: string; // "gemini-2.5-flash", etc.
};

export class FirebaseAiService {

    private static instance: FirebaseAiService;

    static getInstance() {
        if (!FirebaseAiService.instance) {
            FirebaseAiService.instance = new FirebaseAiService();
        }
        return FirebaseAiService.instance;
    }

    ai: AI;
    models: { label: string, value: string }[] | undefined = undefined;
    storageFolder = "";

    constructor() {
        const config = getConfiguration();
        this.ai = getAI(config.client, { backend: new GoogleAIBackend() });
    }

    createParts(project: Project): Part[] {
        const parts: Part[] = [];
        project.contexts.forEach(async (gc) => {
            if (gc.type === 'text') {
                parts.push({ text: gc.value! });
            } else {
                // const uri = await getCoreServices().storageService!.getUrlAsync(`${this.storageFolder}/${project.id}/${gc.name}`);
                // parts.push(createPartFromUri(uri, project.contexts[idx].type));
            }
        });
        return parts;
    }

    async getModels(): Promise<{ label: string, value: string }[]> {
        throw new Error("not implemented")
    }


    // Provide a JSON schema object using a standard format.
    // Later, pass this schema object into `responseSchema` in the generation config.

    createSchema(project: Project): any {
        const fields: string[] = project.outputs.map((o) => o.name);

        const itemProperties =
            Object.fromEntries(
                fields.map(field => [field, { type: "string" }])
            );

        return {
            type: "object",
            properties: {
                characters: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: itemProperties,
                        required: fields
                    },
                },
            },
            required: ["characters"]
        };
    }

    /**
     * Sends a prompt to the AI and tells it which fields to return.
     * 
     * You give it a list of field names (like ["Summary", "Budget"]),
     * and the AI will return a JSON object with those fields filled in.
     */
    async parameterizedQuery(
        project: Project,
        modelType?: string
    ): Promise<any> {
        const parts = this.createParts(project);
        const model = getGenerativeModel(this.ai, {
            model: modelType ?? project.modelType ?? 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
        return model.generateContent([project.prompt, ...parts])
    }

}

