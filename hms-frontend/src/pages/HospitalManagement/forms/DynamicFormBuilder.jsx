import React, { useState, useEffect } from "react";
import { 
  Box, Grid, Paper, Typography, Button, TextField, 
  Switch, FormControlLabel, Select, MenuItem, FormControl, 
  FormLabel, List, ListItem, ListItemButton, ListItemText, 
  ListItemIcon, IconButton, Card, CardContent, Divider
} from "@mui/material";
import { 
  TextFields, Subject, Dialpad, Email, Phone, CalendarToday, 
  AccessTime, DateRange, ArrowDropDown, PlaylistAddCheck, 
  CheckBox, RadioButtonChecked, CloudUpload, Image, Gesture, 
  Title, DragHandle, RemoveCircleOutline, Edit, ArrowUpward, 
  ArrowDownward, Add, SmartToy
} from "@mui/icons-material";

// Field Icons Lookup
const FIELD_ICONS = {
  TEXT: <TextFields />,
  TEXTAREA: <Subject />,
  NUMBER: <Dialpad />,
  EMAIL: <Email />,
  PHONE: <Phone />,
  DATE: <CalendarToday />,
  TIME: <AccessTime />,
  DATETIME: <DateRange />,
  DROPDOWN: <ArrowDropDown />,
  MULTISELECT: <PlaylistAddCheck />,
  CHECKBOX: <CheckBox />,
  RADIO_BUTTON: <RadioButtonChecked />,
  FILE_UPLOAD: <CloudUpload />,
  IMAGE_UPLOAD: <Image />,
  SIGNATURE_PAD: <Gesture />,
  RICH_TEXT_EDITOR: <Subject />,
  PASSWORD: <Dialpad />,
  SWITCH: <Add />,
  RATING: <Add />,
  SECTION_HEADER: <Title />,
  DIVIDER: <DragHandle />,
  AI_GENERATED: <SmartToy />
};

const FIELD_TYPES = [
  { type: "TEXT", label: "Text Input", icon: <TextFields /> },
  { type: "TEXTAREA", label: "Text Area", icon: <Subject /> },
  { type: "NUMBER", label: "Number Input", icon: <Dialpad /> },
  { type: "EMAIL", label: "Email Address", icon: <Email /> },
  { type: "PHONE", label: "Phone Number", icon: <Phone /> },
  { type: "DATE", label: "Date Picker", icon: <CalendarToday /> },
  { type: "TIME", label: "Time Picker", icon: <AccessTime /> },
  { type: "DATETIME", label: "Date & Time", icon: <DateRange /> },
  { type: "DROPDOWN", label: "Dropdown Select", icon: <ArrowDropDown /> },
  { type: "MULTISELECT", label: "Multi Select", icon: <PlaylistAddCheck /> },
  { type: "CHECKBOX", label: "Checkboxes", icon: <CheckBox /> },
  { type: "RADIO_BUTTON", label: "Radio Buttons", icon: <RadioButtonChecked /> },
  { type: "FILE_UPLOAD", label: "File Uploader", icon: <CloudUpload /> },
  { type: "IMAGE_UPLOAD", label: "Image Uploader", icon: <Image /> },
  { type: "SIGNATURE_PAD", label: "Signature Pad", icon: <Gesture /> },
  { type: "RICH_TEXT_EDITOR", label: "Rich Text Editor", icon: <Subject /> },
  { type: "PASSWORD", label: "Password Input", icon: <Dialpad /> },
  { type: "SWITCH", label: "Switch Toggle", icon: <Add /> },
  { type: "RATING", label: "Rating Stars", icon: <Add /> },
  { type: "SECTION_HEADER", label: "Section Header", icon: <Title /> },
  { type: "DIVIDER", label: "Section Divider", icon: <DragHandle /> },
  { type: "AI_GENERATED", label: "AI Generated Field", icon: <SmartToy /> }
];

export default function DynamicFormBuilder({ formStructure, onSave, onCancel }) {
  const [formName, setFormName] = useState("");
  const [description, setDescription] = useState("");
  const [roleBasedAccess, setRoleBasedAccess] = useState("");
  const [workflowIntegration, setWorkflowIntegration] = useState("");
  const [publicAccess, setPublicAccess] = useState(false);
  const [fields, setFields] = useState([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(null);

  // Initialize from existing structure if editing
  useEffect(() => {
    if (formStructure) {
      setFormName(formStructure.formName || "");
      setDescription(formStructure.description || "");
      setRoleBasedAccess(formStructure.roleBasedAccess || "");
      setWorkflowIntegration(formStructure.workflowIntegration || "");
      setPublicAccess(!!formStructure.publicAccess);
      setFields(formStructure.fields ? [...formStructure.fields] : []);
      setSelectedFieldIndex(null);
    }
  }, [formStructure]);

  const handleAddField = (type) => {
    const defaultLabel = `Custom ${type.replace("_", " ")}`;
    
    // Auto-camelCase name
    const defaultName = defaultLabel
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "");

    const newField = {
      fieldType: type,
      fieldLabel: defaultLabel,
      fieldName: defaultName,
      required: false,
      validationJson: JSON.stringify({ helpText: "" }),
      optionsJson: JSON.stringify(["Option 1", "Option 2"]),
      conditionalJson: "",
      displayOrder: fields.length + 1
    };

    setFields([...fields, newField]);
    setSelectedFieldIndex(fields.length); // Select new field
  };

  const handleRemoveField = (idx) => {
    const updated = fields.filter((_, i) => i !== idx);
    // Reset display orders
    updated.forEach((f, i) => {
      f.displayOrder = i + 1;
    });
    setFields(updated);
    if (selectedFieldIndex === idx) {
      setSelectedFieldIndex(null);
    } else if (selectedFieldIndex > idx) {
      setSelectedFieldIndex(selectedFieldIndex - 1);
    }
  };

  const moveField = (idx, direction) => {
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === fields.length - 1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    const updated = [...fields];
    
    // Swap
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Reset display orders
    updated.forEach((f, i) => {
      f.displayOrder = i + 1;
    });

    setFields(updated);
    setSelectedFieldIndex(targetIdx);
  };

  const updateSelectedField = (key, value) => {
    if (selectedFieldIndex === null) return;
    const updated = [...fields];
    updated[selectedFieldIndex] = {
      ...updated[selectedFieldIndex],
      [key]: value
    };
    setFields(updated);
  };

  const updateSelectedFieldValidation = (rulesUpdate) => {
    if (selectedFieldIndex === null) return;
    const field = fields[selectedFieldIndex];
    let currentRules = {};
    try {
      currentRules = field.validationJson ? JSON.parse(field.validationJson) : {};
    } catch (e) {}

    const nextRules = { ...currentRules, ...rulesUpdate };
    updateSelectedField("validationJson", JSON.stringify(nextRules));
  };

  const updateSelectedFieldConditional = (condUpdate) => {
    if (selectedFieldIndex === null) return;
    const field = fields[selectedFieldIndex];
    let currentCond = {};
    try {
      currentCond = field.conditionalJson ? JSON.parse(field.conditionalJson) : {};
    } catch (e) {}

    const nextCond = { ...currentCond, ...condUpdate };
    updateSelectedField("conditionalJson", JSON.stringify(nextCond));
  };

  const getValidationRule = (key, defaultVal = "") => {
    if (selectedFieldIndex === null) return defaultVal;
    const field = fields[selectedFieldIndex];
    try {
      const rules = field.validationJson ? JSON.parse(field.validationJson) : {};
      return rules[key] !== undefined ? rules[key] : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  const getConditionalRule = (key, defaultVal = "") => {
    if (selectedFieldIndex === null) return defaultVal;
    const field = fields[selectedFieldIndex];
    try {
      const cond = field.conditionalJson ? JSON.parse(field.conditionalJson) : {};
      return cond[key] !== undefined ? cond[key] : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  const getOptionsList = () => {
    if (selectedFieldIndex === null) return "";
    const field = fields[selectedFieldIndex];
    try {
      const parsed = field.optionsJson ? JSON.parse(field.optionsJson) : [];
      return Array.isArray(parsed) ? parsed.join(", ") : "";
    } catch (e) {
      return "";
    }
  };

  const handleOptionsChange = (val) => {
    const list = val.split(",").map(o => o.trim()).filter(o => o !== "");
    updateSelectedField("optionsJson", JSON.stringify(list));
  };

  const handleSave = () => {
    if (!formName.trim()) {
      alert("Form Name is required");
      return;
    }
    const finalPayload = {
      ...formStructure,
      formName,
      description,
      roleBasedAccess,
      workflowIntegration,
      publicAccess,
      fields
    };
    onSave(finalPayload);
  };

  const currentSelectedField = selectedFieldIndex !== null ? fields[selectedFieldIndex] : null;

  return (
    <Box sx={{ p: 1 }}>
      {/* Top Header Card */}
      <Card sx={{ mb: 3, borderRadius: "14px", border: "1px solid var(--hm-card-border)", background: "var(--hm-card)" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: "#065F46" }}>
            {formStructure?.id ? "Edit Custom Form template" : "Create New Custom Form Template"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Form Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                fullWidth
                required
                placeholder="e.g. COVID-19 Screening"
                sx={{ mb: 2 }}
              />
              <TextField
                label="Form Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                placeholder="Describe the purpose of this custom form..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Role Based Access"
                value={roleBasedAccess}
                onChange={(e) => setRoleBasedAccess(e.target.value)}
                fullWidth
                placeholder="e.g. ROLE_DOCTOR, ROLE_NURSE (Leave empty for all)"
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Workflow Trigger Key"
                    value={workflowIntegration}
                    onChange={(e) => setWorkflowIntegration(e.target.value)}
                    fullWidth
                    placeholder="e.g. INSURANCE_CLAIM_SUBMITTED"
                  />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={publicAccess}
                        onChange={(e) => setPublicAccess(e.target.checked)}
                      />
                    }
                    label="Public Link Access"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Builder Grid */}
      <Grid container spacing={3}>
        {/* Left Panel: Available Field Types */}
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "14px", background: "var(--hm-card)", borderColor: "var(--hm-card-border)" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--hm-text-muted)" }}>
              Field Library
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List dense sx={{ maxHeight: "calc(100vh - 380px)", overflowY: "auto", pr: 0.5 }}>
              {FIELD_TYPES.map(ft => (
                <ListItem key={ft.type} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    onClick={() => handleAddField(ft.type)}
                    sx={{ 
                      borderRadius: "8px", 
                      border: "1.5px solid var(--hm-input-border)", 
                      background: "var(--hm-input-bg)",
                      "&:hover": { background: "#F0FDF4", borderColor: "#A7F3D0" }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: "#059669" }}>{ft.icon}</ListItemIcon>
                    <ListItemText primary={ft.label} primaryTypographyProps={{ fontSize: 12.5, fontWeight: 700 }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Center Panel: Canvas Editor */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "14px", background: "var(--hm-card)", borderColor: "var(--hm-card-border)", minHeight: "500px", display: "flex", flexDirection: "column" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--hm-text-muted)" }}>
              Form Canvas ({fields.length} fields)
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {fields.length === 0 ? (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed var(--hm-input-border)", borderRadius: "12px", p: 4, my: 2 }}>
                <Typography variant="h2" sx={{ mb: 1, filter: "grayscale(100%)", opacity: 0.4 }}>📋</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--hm-text-faint)", textCenter: "center" }}>
                  Canvas is empty. Click fields from the library on the left to start building your custom form.
                </Typography>
              </Box>
            ) : (
              <List sx={{ flex: 1, maxHeight: "calc(100vh - 350px)", overflowY: "auto" }}>
                {fields.map((field, idx) => {
                  const isSelected = selectedFieldIndex === idx;
                  return (
                    <ListItem
                      key={idx}
                      onClick={() => setSelectedFieldIndex(idx)}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: "10px",
                        border: "1.5px solid",
                        cursor: "pointer",
                        borderColor: isSelected ? "#059669" : "var(--hm-card-border)",
                        background: isSelected ? "linear-gradient(135deg, #F0FDF4 0%, #E6FDF0 100%)" : "var(--hm-input-bg)",
                        transition: "all 0.15s",
                        "&:hover": { borderColor: "#059669" }
                      }}
                      secondaryAction={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); moveField(idx, "up"); }} disabled={idx === 0}>
                            <ArrowUpward fontSize="inherit" />
                          </IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); moveField(idx, "down"); }} disabled={idx === fields.length - 1}>
                            <ArrowDownward fontSize="inherit" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleRemoveField(idx); }}>
                            <RemoveCircleOutline fontSize="inherit" />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: isSelected ? "#059669" : "var(--hm-text-muted)" }}>
                        {FIELD_ICONS[field.fieldType] || <TextFields />}
                      </ListItemIcon>
                      <ListItemText
                        primary={field.fieldLabel}
                        secondary={`${field.fieldName} • ${field.fieldType}`}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#047857" : "var(--hm-text)" }}
                        secondaryTypographyProps={{ fontSize: 11, fontWeight: 500, fontFamily: "monospace" }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" color="inherit" onClick={onCancel} sx={{ textTransform: "none", fontWeight: 700 }}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} sx={{ background: "linear-gradient(135deg, #065F46 0%, #047857 100%)", textTransform: "none", fontWeight: 700 }}>
                Save Template
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel: Selected Field Properties Panel */}
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: "14px", background: "var(--hm-card)", borderColor: "var(--hm-card-border)", minHeight: "500px" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: "uppercase", letterSpacing: 0.5, color: "var(--hm-text-muted)" }}>
              Field Configuration
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!currentSelectedField ? (
              <Box sx={{ py: 8, textCenter: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h2" sx={{ filter: "grayscale(100%)", opacity: 0.3, mb: 1 }}>⚙️</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "var(--hm-text-faint)" }}>
                  Select a field in the canvas to configure its validation, labels, options, and visibility logic.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: "calc(100vh - 350px)", overflowY: "auto", pr: 0.5 }}>
                {/* Base Settings */}
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#065F46", textTransform: "uppercase", display: "block", mb: 1 }}>
                  General Settings
                </Typography>
                <TextField
                  label="Field Label"
                  value={currentSelectedField.fieldLabel}
                  onChange={(e) => {
                    const l = e.target.value;
                    const defaultName = l
                      .toLowerCase()
                      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
                      .replace(/[^a-zA-Z0-9]/g, "");
                    updateSelectedField("fieldLabel", l);
                    // Only update fieldName if it hasn't been heavily customized (or if empty)
                    if (!currentSelectedField.fieldName) {
                      updateSelectedField("fieldName", defaultName);
                    }
                  }}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Field Name (JSON key)"
                  value={currentSelectedField.fieldName}
                  onChange={(e) => updateSelectedField("fieldName", e.target.value.replace(/[^a-zA-Z0-9]/g, ""))}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  inputProps={{ style: { fontFamily: "monospace" } }}
                />
                
                {/* Options List for Dropdown, Multiselect, Checkbox, Radio */}
                {["DROPDOWN", "MULTISELECT", "CHECKBOX", "RADIO_BUTTON"].includes(currentSelectedField.fieldType) && (
                  <TextField
                    label="Options (Comma separated)"
                    value={getOptionsList()}
                    onChange={(e) => handleOptionsChange(e.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    helperText="Comma-separated options, e.g. Male, Female, Other"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Validation Settings */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#065F46", textTransform: "uppercase", display: "block", mb: 1 }}>
                  Validation Rules
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentSelectedField.required}
                      onChange={(e) => updateSelectedField("required", e.target.checked)}
                    />
                  }
                  label="Is Required Field"
                  sx={{ mb: 1, display: "block" }}
                />

                <TextField
                  label="Help text / Instructions"
                  value={getValidationRule("helpText")}
                  onChange={(e) => updateSelectedFieldValidation({ helpText: e.target.value })}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Default Value"
                  value={getValidationRule("defaultValue")}
                  onChange={(e) => updateSelectedFieldValidation({ defaultValue: e.target.value })}
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                />

                {/* Number specific rules */}
                {currentSelectedField.fieldType === "NUMBER" && (
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        label="Min Value"
                        type="number"
                        value={getValidationRule("minValue")}
                        onChange={(e) => updateSelectedFieldValidation({ minValue: e.target.value === "" ? "" : Number(e.target.value) })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max Value"
                        type="number"
                        value={getValidationRule("maxValue")}
                        onChange={(e) => updateSelectedFieldValidation({ maxValue: e.target.value === "" ? "" : Number(e.target.value) })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Text specific rules */}
                {["TEXT", "TEXTAREA", "RICH_TEXT_EDITOR", "PASSWORD", "EMAIL"].includes(currentSelectedField.fieldType) && (
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        label="Min Length"
                        type="number"
                        value={getValidationRule("minLength")}
                        onChange={(e) => updateSelectedFieldValidation({ minLength: e.target.value === "" ? "" : Number(e.target.value) })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Max Length"
                        type="number"
                        value={getValidationRule("maxLength")}
                        onChange={(e) => updateSelectedFieldValidation({ maxLength: e.target.value === "" ? "" : Number(e.target.value) })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                )}

                {/* Regex validation pattern */}
                {["TEXT", "TEXTAREA", "PHONE"].includes(currentSelectedField.fieldType) && (
                  <>
                    <TextField
                      label="Regex Pattern"
                      value={getValidationRule("pattern")}
                      onChange={(e) => updateSelectedFieldValidation({ pattern: e.target.value })}
                      fullWidth
                      size="small"
                      placeholder="e.g. ^[A-Z]{3}$"
                      sx={{ mb: 1 }}
                      inputProps={{ style: { fontFamily: "monospace" } }}
                    />
                    <TextField
                      label="Regex Error Message"
                      value={getValidationRule("patternMessage")}
                      onChange={(e) => updateSelectedFieldValidation({ patternMessage: e.target.value })}
                      fullWidth
                      size="small"
                      placeholder="Invalid Format"
                      sx={{ mb: 2 }}
                    />
                  </>
                )}

                {/* Visibility/Conditional Rules */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: "#065F46", textTransform: "uppercase", display: "block", mb: 1 }}>
                  Conditional Rules
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 1 }}>
                  Make this field visible based on the values of another field.
                </Typography>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <FormLabel sx={{ fontSize: 11, fontWeight: 700, mb: 0.5 }}>If field...</FormLabel>
                  <Select
                    value={getConditionalRule("field")}
                    onChange={(e) => updateSelectedFieldConditional({ field: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value=""><em>None (Always visible)</em></MenuItem>
                    {fields
                      .filter((_, i) => i !== selectedFieldIndex) // Cannot depend on self
                      .map(f => (
                        <MenuItem key={f.fieldName} value={f.fieldName}>{f.fieldLabel} ({f.fieldName})</MenuItem>
                      ))}
                  </Select>
                </FormControl>

                {getConditionalRule("field") && (
                  <>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <FormLabel sx={{ fontSize: 11, fontWeight: 700, mb: 0.5 }}>Operator</FormLabel>
                      <Select
                        value={getConditionalRule("operator", "EQUALS")}
                        onChange={(e) => updateSelectedFieldConditional({ operator: e.target.value })}
                      >
                        <MenuItem value="EQUALS">Equals</MenuItem>
                        <MenuItem value="NOT_EQUALS">Does not equal</MenuItem>
                        <MenuItem value="GREATER_THAN">Is greater than</MenuItem>
                        <MenuItem value="LESS_THAN">Is less than</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Expected Value"
                      value={getConditionalRule("value")}
                      onChange={(e) => updateSelectedFieldConditional({ value: e.target.value })}
                      fullWidth
                      size="small"
                      placeholder="e.g. Male, 18, True"
                      sx={{ mb: 2 }}
                    />
                  </>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
