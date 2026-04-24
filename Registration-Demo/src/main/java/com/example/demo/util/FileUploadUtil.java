package com.example.demo.util;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

public class FileUploadUtil {
    
    private static final String UPLOAD_DIR = "uploads/";
    private static final String BASE_URL = "/uploads/";
    
    static {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    public static String saveFile(MultipartFile file, String userId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = userId + "_" + UUID.randomUUID().toString() + extension;
        Path filePath = Paths.get(UPLOAD_DIR + filename);
        Files.write(filePath, file.getBytes());
        
        return filename;
    }
    
    public static void deleteFile(String filename) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR + filename);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
        }
    }
    
    public static String getFileUrl(String filename) {
        return BASE_URL + filename;
    }
}