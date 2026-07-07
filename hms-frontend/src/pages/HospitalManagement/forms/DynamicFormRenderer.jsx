import React, { useState, useEffect, useRef } from "react";
import { 
  Box, Grid, TextField, FormControl, FormLabel, RadioGroup, 
  FormControlLabel, Radio, Checkbox, FormGroup, Select, 
  MenuItem, Button, Switch, Slider, Typography, Divider, 
  CircularProgress, Alert, Snackbar, Paper
} from "@mui/material";

// Custom HTML5 Canvas Signature Pad
function SignaturePad({ value, onChange, label }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    
    // Clear canvas and draw existing signature if present
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const dataUrl = canvasRef.current.toDataURL();
    onChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--hm-text-muted)", display: "block", mb: 1, textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Paper variant="outlined" sx={{ p: 1, display: "inline-block", background: "#fff", borderColor: "var(--hm-card-border)" }}>
        <canvas
          ref={canvasRef}
          width={360}
          height={140}
          style={{ border: "1px dashed #CBD5E1", cursor: "crosshair", display: "block", background: "#FAFBFD" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
          <Button size="small" color="error" variant="text" onClick={clearSignature} sx={{ fontSize: 11, fontWeight: 700 }}>
            Clear Signature
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default function DynamicFormRenderer({ formStructure, onSubmit, isSubmitting = false, externalErrors = {} }) {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form default values
  useEffect(() => {
    if (formStructure && formStructure.fields) {
      const defaults = {};
      formStructure.fields.forEach(field => {
        let defVal = "";
        
        // Parse validation settings for default values
        if (field.validationJson) {
          try {
            const rules = JSON.parse(field.validationJson);
            if (rules.defaultValue !== undefined) {
              defVal = rules.defaultValue;
            }
          } catch (e) {}
        }
        
        // Match base type default structures
        if (field.fieldType === "MULTISELECT" || field.fieldType === "CHECKBOX") {
          defaults[field.fieldName] = Array.isArray(defVal) ? defVal : [];
        } else if (field.fieldType === "SWITCH") {
          defaults[field.fieldName] = defVal === "true" || defVal === true;
        } else if (field.fieldType === "RATING") {
          defaults[field.fieldName] = Number(defVal) || 0;
        } else {
          defaults[field.fieldName] = defVal || "";
        }
      });
      setFormData(defaults);
      setValidationErrors({});
    }
  }, [formStructure]);

  if (!formStructure || !formStructure.fields) {
    return <Alert severity="info">No fields defined for this form.</Alert>;
  }

  const fields = formStructure.fields;

  // Evaluate Visibility Rules (Conditional Logic)
  // Evaluates logic: IF targetField = expectedValue SHOW
  const isFieldVisible = (field) => {
    if (!field.conditionalJson) return true;
    try {
      const condition = JSON.parse(field.conditionalJson);
      if (!condition || !condition.field) return true;
      
      const dependencyField = condition.field;
      const operator = condition.operator || "EQUALS";
      const expectedValue = condition.value;
      const actualValue = formData[dependencyField];

      if (operator === "EQUALS") {
        return String(actualValue).toLowerCase() === String(expectedValue).toLowerCase();
      } else if (operator === "NOT_EQUALS") {
        return String(actualValue).toLowerCase() !== String(expectedValue).toLowerCase();
      } else if (operator === "GREATER_THAN") {
        return Number(actualValue) > Number(expectedValue);
      } else if (operator === "LESS_THAN") {
        return Number(actualValue) < Number(expectedValue);
      }
    } catch (e) {
      console.warn("Failed to parse visibility condition:", e);
    }
    return true;
  };

  const handleFieldChange = (name, val) => {
    setFormData(prev => ({ ...prev, [name]: val }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileUpload = (name, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Convert file to base64 for easy JSON storage
    const reader = new FileReader();
    reader.onloadend = () => {
      handleFieldChange(name, {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        data: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Perform dynamic validation
    const errors = {};
    fields.forEach(field => {
      if (!isFieldVisible(field)) return;

      const name = field.fieldName;
      const val = formData[name];
      const valStr = val !== undefined && val !== null ? String(val).trim() : "";

      if (field.required && (!val || valStr === "" || (Array.isArray(val) && val.length === 0))) {
        errors[name] = `${field.fieldLabel} is required`;
        return;
      }

      if (field.validationJson && valStr !== "") {
        try {
          const rules = JSON.parse(field.validationJson);
          if (rules.minLength && valStr.length < Number(rules.minLength)) {
            errors[name] = `Must be at least ${rules.minLength} characters`;
          }
          if (rules.maxLength && valStr.length > Number(rules.maxLength)) {
            errors[name] = `Cannot exceed ${rules.maxLength} characters`;
          }
          if (field.fieldType === "NUMBER") {
            const num = Number(val);
            if (rules.minValue !== undefined && num < Number(rules.minValue)) {
              errors[name] = `Value must be at least ${rules.minValue}`;
            }
            if (rules.maxValue !== undefined && num > Number(rules.maxValue)) {
              errors[name] = `Value cannot exceed ${rules.maxValue}`;
            }
          }
          if (rules.pattern) {
            const regex = new RegExp(rules.pattern);
            if (!regex.test(valStr)) {
              errors[name] = rules.patternMessage || "Invalid format";
            }
          }
        } catch (e) {}
      }

      if (field.fieldType === "EMAIL" && valStr !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valStr)) {
          errors[name] = "Please enter a valid email address";
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Submission payload filter out hidden fields
    const submissionPayload = {};
    fields.forEach(field => {
      if (isFieldVisible(field)) {
        submissionPayload[field.fieldName] = formData[field.fieldName];
      }
    });

    onSubmit(submissionPayload);
  };

  const getOptions = (field) => {
    if (!field.optionsJson) return [];
    try {
      const parsed = JSON.parse(field.optionsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn("Failed to parse field options JSON:", e);
      return [];
    }
  };

  const renderField = (field) => {
    if (!isFieldVisible(field)) return null;

    const name = field.fieldName;
    const value = formData[name];
    const errorText = validationErrors[name] || externalErrors[name];
    const isRequired = field.required;
    const placeholder = field.fieldLabel;
    
    let helpText = "";
    if (field.validationJson) {
      try {
        helpText = JSON.parse(field.validationJson).helpText || "";
      } catch (e) {}
    }

    const muiFieldProps = {
      label: field.fieldLabel,
      required: isRequired,
      error: !!errorText,
      helperText: errorText || helpText,
      fullWidth: true,
      size: "medium",
      variant: "outlined",
      placeholder: placeholder,
      sx: { mb: 2 }
    };

    switch (field.fieldType) {
      case "SECTION_HEADER":
        return (
          <Box sx={{ mt: 2, mb: 1, width: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#065F46" }}>
              {field.fieldLabel}
            </Typography>
            {helpText && <Typography variant="caption" sx={{ color: "var(--hm-text-muted)" }}>{helpText}</Typography>}
          </Box>
        );

      case "DIVIDER":
        return <Divider sx={{ my: 2, borderColor: "var(--hm-divider)", width: "100%" }} />;

      case "TEXT":
      case "EMAIL":
      case "PASSWORD":
      case "PHONE":
        return (
          <TextField
            {...muiFieldProps}
            type={field.fieldType.toLowerCase() === "phone" ? "tel" : field.fieldType.toLowerCase()}
            value={value || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
          />
        );

      case "TEXTAREA":
      case "RICH_TEXT_EDITOR":
        return (
          <TextField
            {...muiFieldProps}
            multiline
            rows={4}
            value={value || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
          />
        );

      case "NUMBER":
        return (
          <TextField
            {...muiFieldProps}
            type="number"
            value={value !== undefined ? value : ""}
            onChange={(e) => handleFieldChange(name, e.target.value === "" ? "" : Number(e.target.value))}
          />
        );

      case "DATE":
        return (
          <TextField
            {...muiFieldProps}
            type="date"
            InputLabelProps={{ shrink: true }}
            value={value || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
          />
        );

      case "TIME":
        return (
          <TextField
            {...muiFieldProps}
            type="time"
            InputLabelProps={{ shrink: true }}
            value={value || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
          />
        );

      case "DATETIME":
        return (
          <TextField
            {...muiFieldProps}
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={value || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
          />
        );

      case "DROPDOWN":
        return (
          <FormControl fullWidth error={!!errorText} sx={{ mb: 2 }}>
            <FormLabel required={isRequired} sx={{ mb: 0.5, fontSize: "12px", fontWeight: 700, color: "var(--hm-text-muted)" }}>
              {field.fieldLabel}
            </FormLabel>
            <Select
              value={value || ""}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              displayEmpty
            >
              <MenuItem value=""><em>Select {field.fieldLabel}</em></MenuItem>
              {getOptions(field).map((o, idx) => (
                <MenuItem key={idx} value={o}>{o}</MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color={errorText ? "error" : "textSecondary"} sx={{ mt: 0.5 }}>
              {errorText || helpText}
            </Typography>
          </FormControl>
        );

      case "MULTISELECT":
        return (
          <FormControl fullWidth error={!!errorText} sx={{ mb: 2 }}>
            <FormLabel required={isRequired} sx={{ mb: 0.5, fontSize: "12px", fontWeight: 700, color: "var(--hm-text-muted)" }}>
              {field.fieldLabel}
            </FormLabel>
            <Select
              multiple
              value={Array.isArray(value) ? value : []}
              onChange={(e) => handleFieldChange(name, e.target.value)}
              renderValue={(selected) => selected.join(", ")}
            >
              {getOptions(field).map((o, idx) => (
                <MenuItem key={idx} value={o}>
                  <Checkbox checked={(Array.isArray(value) ? value : []).indexOf(o) > -1} />
                  {o}
                </MenuItem>
              ))}
            </Select>
            <Typography variant="caption" color={errorText ? "error" : "textSecondary"} sx={{ mt: 0.5 }}>
              {errorText || helpText}
            </Typography>
          </FormControl>
        );

      case "RADIO_BUTTON":
        return (
          <FormControl component="fieldset" error={!!errorText} sx={{ mb: 2, display: "block" }}>
            <FormLabel component="legend" required={isRequired} sx={{ fontSize: "12px", fontWeight: 700, color: "var(--hm-text-muted)", mb: 0.5 }}>
              {field.fieldLabel}
            </FormLabel>
            <RadioGroup
              row
              value={value || ""}
              onChange={(e) => handleFieldChange(name, e.target.value)}
            >
              {getOptions(field).map((o, idx) => (
                <FormControlLabel key={idx} value={o} control={<Radio />} label={o} />
              ))}
            </RadioGroup>
            {errorText && <Typography variant="caption" color="error">{errorText}</Typography>}
            {helpText && !errorText && <Typography variant="caption" color="textSecondary">{helpText}</Typography>}
          </FormControl>
        );

      case "CHECKBOX":
        return (
          <FormControl component="fieldset" error={!!errorText} sx={{ mb: 2, display: "block" }}>
            <FormLabel component="legend" required={isRequired} sx={{ fontSize: "12px", fontWeight: 700, color: "var(--hm-text-muted)", mb: 0.5 }}>
              {field.fieldLabel}
            </FormLabel>
            <FormGroup row>
              {getOptions(field).map((o, idx) => {
                const arr = Array.isArray(value) ? value : [];
                const checked = arr.includes(o);
                const handleToggle = () => {
                  const nextArr = checked ? arr.filter(v => v !== o) : [...arr, o];
                  handleFieldChange(name, nextArr);
                };
                return (
                  <FormControlLabel
                    key={idx}
                    control={<Checkbox checked={checked} onChange={handleToggle} />}
                    label={o}
                  />
                );
              })}
            </FormGroup>
            {errorText && <Typography variant="caption" color="error">{errorText}</Typography>}
            {helpText && !errorText && <Typography variant="caption" color="textSecondary">{helpText}</Typography>}
          </FormControl>
        );

      case "SWITCH":
        return (
          <FormControl component="fieldset" sx={{ mb: 2, display: "block" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!value}
                  onChange={(e) => handleFieldChange(name, e.target.checked)}
                />
              }
              label={field.fieldLabel}
            />
            {helpText && <Typography variant="caption" color="textSecondary" display="block">{helpText}</Typography>}
          </FormControl>
        );

      case "RATING":
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--hm-text-muted)", mb: 0.5 }}>
              {field.fieldLabel} {isRequired && "*"}
            </Typography>
            <Slider
              value={value || 0}
              onChange={(e, val) => handleFieldChange(name, val)}
              step={1}
              marks
              min={0}
              max={5}
              valueLabelDisplay="auto"
              sx={{ color: "#059669", width: 200 }}
            />
            {errorText && <Typography variant="caption" color="error" display="block">{errorText}</Typography>}
            {helpText && !errorText && <Typography variant="caption" color="textSecondary" display="block">{helpText}</Typography>}
          </Box>
        );

      case "FILE_UPLOAD":
      case "IMAGE_UPLOAD":
        return (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--hm-text-muted)", display: "block", mb: 0.5, textTransform: "uppercase" }}>
              {field.fieldLabel} {isRequired && "*"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button variant="outlined" component="label" sx={{ borderColor: "#CBD5E1", color: "var(--hm-text)" }}>
                Choose File
                <input
                  type="file"
                  hidden
                  accept={field.fieldType === "IMAGE_UPLOAD" ? "image/*" : "*/*"}
                  onChange={(e) => handleFileUpload(name, e)}
                />
              </Button>
              {value && (
                <Typography variant="body2" sx={{ color: "#059669", fontWeight: 600 }}>
                  ✓ {value.fileName} ({(value.fileSize / 1024).toFixed(1)} KB)
                </Typography>
              )}
            </Box>
            {errorText && <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>{errorText}</Typography>}
            {helpText && !errorText && <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 0.5 }}>{helpText}</Typography>}
          </Box>
        );

      case "SIGNATURE_PAD":
        return (
          <SignaturePad
            label={field.fieldLabel}
            value={value || ""}
            onChange={(val) => handleFieldChange(name, val)}
          />
        );

      case "AI_GENERATED":
        return (
          <TextField
            {...muiFieldProps}
            label={`${field.fieldLabel} (AI Field)`}
            value={value || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
          />
        );

      default:
        return (
          <TextField
            {...muiFieldProps}
            value={value || ""}
            onChange={(e) => handleFieldChange(name, e.target.value)}
          />
        );
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Grid container spacing={2}>
        {fields.map((field) => (
          <Grid 
            item 
            xs={12} 
            key={field.fieldName}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            {renderField(field)}
          </Grid>
        ))}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #065F46 0%, #047857 100%)",
              color: "#fff",
              fontWeight: 700,
              py: 1.2,
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(4,120,87,0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #047857 0%, #065F46 100%)",
              }
            }}
          >
            {isSubmitting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit Form"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
