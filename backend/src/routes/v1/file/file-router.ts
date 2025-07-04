import express, { Request, Response, NextFunction } from 'express';
import { archiveFiles, deleteFiles, listOfFilesFromDir, mkdir, moveFiles, moveUploadFiles, renameFiles } from '../../../utils/file-manager';
import formidable from "formidable"
import { requireAuth, requirePermission } from '../../../middleware/auth';

const router = express.Router();

// List files - requires authentication and read permission
router.post("/files", 
    requireAuth, 
    requirePermission('canRead'), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const path = req.body.path;
            const results = await listOfFilesFromDir(path);
            res.send(results);
        } catch (error) {
            next(error);
        }
    }
);

// Create directory - requires authentication and create folder permission
router.post("/create-dir", 
    requireAuth, 
    requirePermission('canCreateFolder'), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const currentDir = req.body.currentDir;
            const name = req.body.name;
            const results = await mkdir(name, currentDir);
            res.send(results);
        } catch (error) {
            next(error);
        }
    }
);

// Delete files - requires authentication and delete permission
router.post("/delete-files", 
    requireAuth, 
    requirePermission('canDelete'), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paths = req.body.paths;
            const results = await deleteFiles(paths);
            res.send(results);
        } catch (error) {
            next(error);
        }
    }
);

// Rename files - requires authentication and rename permission
router.post("/rename-files", 
    requireAuth, 
    requirePermission('canRename'), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paths = req.body.paths;
            const name = req.body.name;
            const results = await renameFiles(paths, name);
            res.send(results);
        } catch (error) {
            next(error);
        }
    }
);

// Move files - requires authentication and move permission
router.post("/move-files", 
    requireAuth, 
    requirePermission('canMove'), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paths = req.body.paths;
            const moveDir = req.body.moveDir;
            const currentDir = req.body.currentDir;
            const results = await moveFiles(paths, moveDir, currentDir);
            res.send(results);
        } catch (error) {
            next(error);
        }
    }
);

// Archive files - requires authentication and archive permission
router.post("/archive-files", 
    requireAuth, 
    requirePermission('canArchive'), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const paths = req.body.paths;
            const name = req.body.name;
            const currentDir = req.body.currentDir;
            const results = await archiveFiles(paths, currentDir, name);
            res.send(results);
        } catch (error) {
            next(error);
        }
    }
);

// Upload files - requires authentication and upload permission
router.post("/upload-files", 
    requireAuth, 
    requirePermission('canUpload'), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const form = formidable({ multiples: true });
            form.parse(req, async (err, fields, files) => {
                if (err || !files.file) {
                    res.status(400).send(err);
                    return;
                }
                
                // Add path to request body for permission check
                req.body.path = fields.dir;
                
                // Handle both single and multiple file uploads
                const fileArray = Array.isArray(files.file) ? files.file : [files.file];
                const uploadFiles = fileArray.map((file: any) => ({
                    path: file.filepath,
                    name: file.originalFilename
                }));
                
                const result = await moveUploadFiles(uploadFiles, fields.dir as string);
                res.send(result);
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as fileHandlerRouter };