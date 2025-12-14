const API_BASE_URL = 'https://ocelot-compliance-app-api.vercel.app/api';

export const complianceApi = {
  /**
   * Uploads the blueprint via POST
   * @param {File} file - The file object from the file input
   */
  analyzeBlueprint: async (file) => {
    // 1. Create a FormData object
    // This effectively builds a virtual form <form>...</form> in memory
    const formData = new FormData();
    
    // 2. Append the file
    // 'file' is the key name your backend expects (e.g., upload.single('file'))
    formData.append('file', file); 

    // 3. Send the POST request
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
      // CRITICAL NOTE: Do NOT set 'Content-Type': 'multipart/form-data' manually.
      // The browser automatically sets the correct headers + boundary string
      // when it sees a FormData body.
    });

    if (!response.ok) {
      // Try to get the error message from the server, or fallback to default
      let errorMessage = `Upload failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Response wasn't JSON
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }
};