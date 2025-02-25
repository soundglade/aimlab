import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initializeFileStorage, StoredFile } from "@/lib/file-storage";

// Common test data
const TEST_DATA = "test data";
const PROJECT1 = "project1";
const PROJECT2 = "project2";
const GROUP1 = "group1";

// Test both storage modes with the same meaningful tests
["ephemeral", "persistent"].forEach((mode) => {
  const isEphemeral = mode === "ephemeral";
  const DB_NAME = `test-file-storage-${mode}`;

  describe(`FileStorage - ${mode} mode`, () => {
    let storage: ReturnType<typeof initializeFileStorage>;

    beforeEach(() => {
      storage = initializeFileStorage(DB_NAME, { ephemeral: isEphemeral });
    });

    afterEach(async () => {
      // Clean up after each test
      await storage.cleanupAllFiles();
    });

    it("should save and retrieve a file with correct content", async () => {
      const fileId = await storage.saveFile(TEST_DATA);
      const file = await storage.getFile(fileId);

      expect(file).not.toBeNull();
      expect(file?.id).toBe(fileId);
      expect(file?.data).toBe(TEST_DATA);
    });

    it("should handle non-existent files gracefully", async () => {
      const file = await storage.getFile("non-existent-id");
      expect(file).toBeNull();
    });

    it("should delete files correctly", async () => {
      const fileId = await storage.saveFile(TEST_DATA);

      // Verify file exists
      let file = await storage.getFile(fileId);
      expect(file).not.toBeNull();

      // Delete and verify it's gone
      const result = await storage.deleteFile(fileId);
      expect(result).toBe(true);

      file = await storage.getFile(fileId);
      expect(file).toBeNull();
    });

    it("should retrieve files by project ID", async () => {
      // Save files with different project IDs
      await storage.saveFile("file 1", { projectId: PROJECT1 });
      await storage.saveFile("file 2", { projectId: PROJECT2 });

      const project1Files = await storage.getFilesByProject(PROJECT1);
      expect(project1Files.length).toBe(1);
      expect(project1Files[0].data).toBe("file 1");
    });

    it("should retrieve files by group ID and filter by project ID", async () => {
      // Create files with different group and project IDs
      await storage.saveFile("group1-project1", {
        groupId: GROUP1,
        projectId: PROJECT1,
      });
      await storage.saveFile("group1-project2", {
        groupId: GROUP1,
        projectId: PROJECT2,
      });

      // Get all files in group1
      const groupFiles = await storage.getFilesByGroup(GROUP1);
      expect(groupFiles.length).toBe(2);

      // Get files in group1 and project1
      const filteredFiles = await storage.getFilesByGroup(GROUP1, PROJECT1);
      expect(filteredFiles.length).toBe(1);
      expect(filteredFiles[0].data).toBe("group1-project1");
    });

    it("should clean up old files", async () => {
      // Mock Date.now for testing
      const currentTime = 1600000000000; // Fixed timestamp for testing
      const mockNow = vi.spyOn(Date, "now");

      try {
        // Create an old file (10 days ago)
        mockNow.mockImplementation(
          () => currentTime - 10 * 24 * 60 * 60 * 1000
        );
        const oldFileId = await storage.saveFile("old data");

        // Create a new file
        mockNow.mockImplementation(() => currentTime);
        const newFileId = await storage.saveFile("new data");

        // Clean up files older than 7 days
        await storage.cleanupOldFiles(7);

        // Verify old file is gone, new file remains
        const oldFile = await storage.getFile(oldFileId);
        const newFile = await storage.getFile(newFileId);

        expect(oldFile).toBeNull();
        expect(newFile).not.toBeNull();
      } finally {
        // Restore Date.now
        mockNow.mockRestore();
      }
    });
  });
});
