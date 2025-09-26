import { Dialog, DialogActions, Button } from "@mui/material";
import React, { useMemo } from "react";
import { apiUrl } from "../../apiservice/apiConfig";

export const FilePathPreview = ({ path, open, onClose }) => { 
  const baseUrl = apiUrl.apiEndPoint
  const url = path ? `${baseUrl}/files/${path}` : null;
  const fileType = useMemo(() => {
    if (!url) return null;
    if (url.startsWith('data:')) {
      const mimeType = url.split(';')[0].split(':')[1].toLowerCase();
      if (mimeType.includes('image')) return 'image';
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.includes('video')) return 'video';
      return 'unsupported';
    }
    
    // Handle regular URLs
    try {
      // Get file extension from URL
      const extension = url
        .split('?')[0] // Remove query parameters
        .split('#')[0] // Remove hash
        .split('.')
        .pop()
        .toLowerCase();
      
      // Check file type based on extension
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        return 'image';
      } else if (extension === 'pdf' || url.includes('application/pdf')) {
        return 'pdf';
      } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        return 'video';
      }
    } catch (error) {
      console.error('Error determining file type:', error);
    }
    
    return 'unsupported';
  }, [url]);

  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <img 
              src={url}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <iframe
            src={url.startsWith('data:') ? url : `${url}#toolbar=0`} // Disable PDF toolbar for regular URLs
            width="100%"
            height="100%"
            style={{
              border: 'none',
              display: 'block'
            }}
          />
        );
      
      case 'video':
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <video 
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <source src={url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      
      default:
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <p>File type not supported</p>
            <Button 
              variant="contained" 
              onClick={async () => {
                try {
                  const response = await fetch(url);
                  const blob = await response.blob();
                  const downloadUrl = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = path ? path.split('/').pop() : 'download';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(downloadUrl);
                } catch (error) {
                  console.error('Download failed:', error);
                  // Fallback to opening in new tab
                  window.open(url, '_blank');
                }
              }}
            >
              Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        zIndex: 1400, // Higher than form dialog
        "& .MuiDialog-paper": {
          height: "80vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div style={{ flex: 1, overflow: "hidden" }}>
        {renderContent()}
      </div>
      <DialogActions className="dialog-card-footer">
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {url && (
          <Button 
            variant="contained" 
            onClick={async () => {
              try {
                const response = await fetch(url);
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = path ? path.split('/').pop() : 'download';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
              } catch (error) {
                console.error('Download failed:', error);
                // Fallback to opening in new tab
                window.open(url, '_blank');
              }
            }}
          >
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};