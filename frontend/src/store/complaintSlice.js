import { createSlice } from '@reduxjs/toolkit';

const initialFormState = {
  complaint_source: '',
  customer_name: '',
  product_name: '',
  product_strength: '',
  batch_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity_affected: '',
  quantity_unit: 'kg',
  complaint_type: '',
  complaint_date: '',
  description: '',
  initial_severity: 'Major',
  priority: 'Medium',
  status: 'Pending Triage',
};

const initialState = {
  form: { ...initialFormState },
  riskAssessment: null,
  completeness: {
    score: 0,
    missing_fields: [
      'Product Name',
      'Batch/Lot Number',
      'Manufacturing Date',
      'Expiry Date',
      'Quantity Affected',
      'Complaint Source',
      'Customer Name',
      'Complaint Type',
      'Complaint Description'
    ],
    is_ready_for_gmp_submission: false
  },
  duplicates: [],
  highlightedFields: [],
  isDirty: false,
  lastSavedComplaint: null,
  qaSignOff: null,
};

const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.form[field] = value;
      state.isDirty = true;
    },
    populateFromAI: (state, action) => {
      const { form_data, risk_assessment, completeness, duplicates, updated_fields } = action.payload;
      if (form_data) {
        state.form = { ...state.form, ...form_data };
      }
      if (risk_assessment) {
        state.riskAssessment = risk_assessment;
      }
      if (completeness) {
        state.completeness = completeness;
      }
      if (duplicates) {
        state.duplicates = duplicates;
      }
      if (updated_fields) {
        state.highlightedFields = Object.keys(updated_fields);
      }
      state.isDirty = true;
    },
    clearHighlights: (state) => {
      state.highlightedFields = [];
    },
    resetForm: (state) => {
      state.form = { ...initialFormState };
      state.riskAssessment = null;
      state.completeness = {
        score: 0,
        missing_fields: [
          'Product Name',
          'Batch/Lot Number',
          'Manufacturing Date',
          'Expiry Date',
          'Quantity Affected',
          'Complaint Source',
          'Customer Name',
          'Complaint Type',
          'Complaint Description'
        ],
        is_ready_for_gmp_submission: false
      };
      state.duplicates = [];
      state.highlightedFields = [];
      state.isDirty = false;
      state.qaSignOff = null;
    },
    setLastSavedComplaint: (state, action) => {
      state.lastSavedComplaint = action.payload;
      state.isDirty = false;
    },
    applySignOff: (state, action) => {
      state.qaSignOff = action.payload;
      state.form.status = 'QA Authorized';
      state.isDirty = true;
    },
    revokeSignOff: (state) => {
      state.qaSignOff = null;
      state.form.status = 'Pending Triage';
      state.isDirty = true;
    }
  }
});

export const {
  updateFormField,
  populateFromAI,
  clearHighlights,
  resetForm,
  setLastSavedComplaint,
  applySignOff,
  revokeSignOff
} = complaintSlice.actions;

export default complaintSlice.reducer;

