import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileImage, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileUploadZone({ 
  onFileSelect, 
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
  maxSize = 10 * 1024 * 1024, // 10MB
  className 
}) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      
      // Create preview for images
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const clearFile = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
    onFileSelect(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300",
          "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10 scale-[1.02]",
          isDragReject && "border-destructive bg-destructive/10",
          preview ? "p-4" : "p-8"
        )}
        whileHover={{ scale: preview ? 1 : 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
            >
              <div className="relative rounded-xl overflow-hidden bg-white shadow-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-48 object-contain bg-slate-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {fileName}
                    </span>
                  </div>
                  <motion.button
                    onClick={clearFile}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Click or drag to replace
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <motion.div
                className={cn(
                  "p-4 rounded-full",
                  "bg-gradient-to-br from-primary/20 to-accent/20",
                  isDragActive && "from-primary/30 to-accent/30"
                )}
                animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                {isDragActive ? (
                  <FileImage className="h-10 w-10 text-primary" />
                ) : (
                  <Upload className="h-10 w-10 text-primary" />
                )}
              </motion.div>
              
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-foreground">
                  {isDragActive ? "Drop your document here" : "Upload Document"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag & drop or{" "}
                  <span className="text-primary font-medium">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>

              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute inset-0 opacity-0 hover:opacity-100"
                  style={{
                    background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)",
                  }}
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "linear",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
