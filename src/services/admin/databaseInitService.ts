import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorUtils";

/**
 * Database initialization service to create missing tables
 */
export class DatabaseInitService {
  /**
   * Check if a specific table exists
   */
  static async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { error } = await supabase.from(tableName).select("*").limit(1);

      return !error || error.code !== "42P01";
    } catch (error) {
      return false;
    }
  }

  /**
   * Create study_resources table if it doesn't exist
   */
  static async createStudyResourcesTable(): Promise<boolean> {
    try {
      console.log("Creating study_resources table...");

      // Note: This won't work with RLS in production, but provides guidance
      const { error } = await supabase.rpc("exec_sql", {
        sql: `
        CREATE TABLE IF NOT EXISTS study_resources (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'website', 'tool', 'course')),
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
          url TEXT,
          rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
          provider TEXT,
          duration TEXT,
          tags TEXT[] DEFAULT '{}',
          download_url TEXT,
          is_active BOOLEAN DEFAULT true,
          is_featured BOOLEAN DEFAULT false,
          is_sponsored BOOLEAN DEFAULT false,
          sponsor_name TEXT,
          sponsor_logo TEXT,
          sponsor_url TEXT,
          sponsor_cta TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        `,
      });

      if (error) {
        logError("DatabaseInitService.createStudyResourcesTable", error);
        return false;
      }

      console.log("Study resources table created successfully");
      return true;
    } catch (error) {
      logError("DatabaseInitService.createStudyResourcesTable", error);
      return false;
    }
  }

  /**
   * Create study_tips table if it doesn't exist
   */
  static async createStudyTipsTable(): Promise<boolean> {
    try {
      console.log("Creating study_tips table...");

      const { error } = await supabase.rpc("exec_sql", {
        sql: `
        CREATE TABLE IF NOT EXISTS study_tips (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
          tags TEXT[] DEFAULT '{}',
          is_active BOOLEAN DEFAULT true,
          author TEXT,
          estimated_time TEXT,
          effectiveness INTEGER CHECK (effectiveness >= 0 AND effectiveness <= 100),
          is_sponsored BOOLEAN DEFAULT false,
          sponsor_name TEXT,
          sponsor_logo TEXT,
          sponsor_url TEXT,
          sponsor_cta TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        `,
      });

      if (error) {
        logError("DatabaseInitService.createStudyTipsTable", error);
        return false;
      }

      console.log("Study tips table created successfully");
      return true;
    } catch (error) {
      logError("DatabaseInitService.createStudyTipsTable", error);
      return false;
    }
  }

  /**
   * Initialize all required database tables
   */
  static async initializeDatabase(): Promise<{
    success: boolean;
    message: string;
    tablesCreated: string[];
    errors: string[];
  }> {
    const tablesCreated: string[] = [];
    const errors: string[] = [];

    try {
      console.log("Initializing database tables...");

      // Check and create study_resources table
      const resourcesExists = await this.checkTableExists("study_resources");
      if (!resourcesExists) {
        const created = await this.createStudyResourcesTable();
        if (created) {
          tablesCreated.push("study_resources");
        } else {
          errors.push("Failed to create study_resources table");
        }
      } else {
        console.log("study_resources table already exists");
      }

      // Check and create study_tips table
      const tipsExists = await this.checkTableExists("study_tips");
      if (!tipsExists) {
        const created = await this.createStudyTipsTable();
        if (created) {
          tablesCreated.push("study_tips");
        } else {
          errors.push("Failed to create study_tips table");
        }
      } else {
        console.log("study_tips table already exists");
      }

      const success = errors.length === 0;
      const message = success
        ? `Database initialization completed. ${tablesCreated.length > 0 ? `Created tables: ${tablesCreated.join(", ")}` : "All tables already exist."}`
        : `Database initialization completed with errors: ${errors.join(", ")}`;

      return {
        success,
        message,
        tablesCreated,
        errors,
      };
    } catch (error) {
      logError("DatabaseInitService.initializeDatabase", error);
      return {
        success: false,
        message: `Database initialization failed: ${error instanceof Error ? error.message : String(error)}`,
        tablesCreated,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Get database status information
   */
  static async getDatabaseStatus(): Promise<{
    studyResourcesExists: boolean;
    studyTipsExists: boolean;
    allTablesExist: boolean;
    missingTables: string[];
  }> {
    try {
      const [studyResourcesExists, studyTipsExists] = await Promise.all([
        this.checkTableExists("study_resources"),
        this.checkTableExists("study_tips"),
      ]);

      const missingTables: string[] = [];
      if (!studyResourcesExists) missingTables.push("study_resources");
      if (!studyTipsExists) missingTables.push("study_tips");

      return {
        studyResourcesExists,
        studyTipsExists,
        allTablesExist: missingTables.length === 0,
        missingTables,
      };
    } catch (error) {
      logError("DatabaseInitService.getDatabaseStatus", error);
      return {
        studyResourcesExists: false,
        studyTipsExists: false,
        allTablesExist: false,
        missingTables: ["study_resources", "study_tips"],
      };
    }
  }
}

export default DatabaseInitService;
