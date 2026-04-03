// Export service - generates project scaffold from artifacts
// TODO: Implement export via Tauri shell commands
export async function exportProject(projectId: string, targetDir: string): Promise<void> {
  console.log(`Exporting project ${projectId} to ${targetDir}`);
  // Will be implemented with Tauri file system access
}
