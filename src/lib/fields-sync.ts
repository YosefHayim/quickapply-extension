import { authenticatedFetch, AuthError } from './api';

interface FieldsResponse {
  fields: Record<string, string>;
}

interface UpdateFieldsResponse {
  fields: Record<string, string>;
  updatedAt: string;
}

export async function getServerFields(): Promise<Record<string, string>> {
  try {
    const response = await authenticatedFetch<FieldsResponse>('/fields');
    return response.fields;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Failed to get server fields:', error);
    return {};
  }
}

export async function pushFields(fields: Record<string, string>): Promise<void> {
  try {
    await authenticatedFetch<UpdateFieldsResponse>('/fields', {
      method: 'PUT',
      body: JSON.stringify({ fields }),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Failed to push fields to server:', error);
  }
}

export async function syncOnLogin(localFields: Record<string, string>): Promise<Record<string, string>> {
  try {
    const serverFields = await getServerFields();
    
    const merged: Record<string, string> = { ...serverFields };
    for (const [key, value] of Object.entries(localFields)) {
      merged[key] = value;
    }
    
    await pushFields(merged);
    
    return merged;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Failed to sync fields on login:', error);
    return localFields;
  }
}
