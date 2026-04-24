import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as apiServices from '../services/api';

const featureConfig = {
  'plots': {
    title: 'Plot Inventory & Map', icon: '\u{1F5FA}', service: 'plots',
    columns: ['id', 'plot_number', 'section', 'row', 'plot_type', 'status', 'price'],
    fields: [
      { name: 'section', label: 'Section', type: 'text', required: true },
      { name: 'row', label: 'Row', type: 'text', required: true },
      { name: 'plot_number', label: 'Plot Number', type: 'text', required: true },
      { name: 'plot_type', label: 'Plot Type', type: 'select', options: ['single','double','family','cremation','mausoleum','columbarium'] },
      { name: 'status', label: 'Status', type: 'select', options: ['available','sold','occupied','reserved'] },
      { name: 'price', label: 'Price ($)', type: 'number' },
      { name: 'size_sqft', label: 'Size (sq ft)', type: 'number' },
      { name: 'gps_lat', label: 'GPS Latitude', type: 'number' },
      { name: 'gps_lng', label: 'GPS Longitude', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'burial-records': {
    title: 'Burial Records', icon: '\u{1F4DC}', service: 'burialRecords',
    columns: ['id', 'deceased_first_name', 'deceased_last_name', 'date_of_death', 'date_of_burial', 'funeral_home', 'veteran'],
    fields: [
      { name: 'deceased_first_name', label: 'First Name', type: 'text', required: true },
      { name: 'deceased_last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { name: 'date_of_death', label: 'Date of Death', type: 'date' },
      { name: 'date_of_burial', label: 'Date of Burial', type: 'date' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'cause_of_death', label: 'Cause of Death', type: 'text' },
      { name: 'funeral_home', label: 'Funeral Home', type: 'text' },
      { name: 'veteran', label: 'Veteran', type: 'select', options: ['true','false'] },
      { name: 'veteran_branch', label: 'Military Branch', type: 'text' },
      { name: 'next_of_kin', label: 'Next of Kin', type: 'text' },
      { name: 'next_of_kin_phone', label: 'Next of Kin Phone', type: 'text' },
      { name: 'obituary', label: 'Obituary', type: 'textarea' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'deeds': {
    title: 'Deed & Ownership', icon: '\u{1F4C4}', service: 'deeds',
    columns: ['id', 'deed_number', 'owner_first_name', 'owner_last_name', 'purchase_date', 'deed_type', 'status'],
    fields: [
      { name: 'deed_number', label: 'Deed Number', type: 'text', required: true },
      { name: 'owner_first_name', label: 'Owner First Name', type: 'text', required: true },
      { name: 'owner_last_name', label: 'Owner Last Name', type: 'text', required: true },
      { name: 'owner_email', label: 'Email', type: 'email' },
      { name: 'owner_phone', label: 'Phone', type: 'text' },
      { name: 'owner_address', label: 'Address', type: 'textarea' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
      { name: 'purchase_price', label: 'Purchase Price', type: 'number' },
      { name: 'deed_type', label: 'Deed Type', type: 'select', options: ['perpetual','term','pre-need','at-need'] },
      { name: 'status', label: 'Status', type: 'select', options: ['active','transferred','expired','cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'interment-schedules': {
    title: 'Interment Scheduling', icon: '\u{1F4C5}', service: 'intermentSchedules',
    columns: ['id', 'deceased_name', 'scheduled_date', 'scheduled_time', 'interment_type', 'funeral_home', 'status'],
    fields: [
      { name: 'deceased_name', label: 'Deceased Name', type: 'text', required: true },
      { name: 'scheduled_date', label: 'Scheduled Date', type: 'date', required: true },
      { name: 'scheduled_time', label: 'Scheduled Time', type: 'time' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'interment_type', label: 'Type', type: 'select', options: ['burial','cremation','entombment','inurnment'] },
      { name: 'funeral_home', label: 'Funeral Home', type: 'text' },
      { name: 'funeral_director', label: 'Funeral Director', type: 'text' },
      { name: 'officiant', label: 'Officiant', type: 'text' },
      { name: 'expected_attendees', label: 'Expected Attendees', type: 'number' },
      { name: 'special_requests', label: 'Special Requests', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled','completed','cancelled','postponed'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'pre-need-contracts': {
    title: 'Pre-Need Contracts', icon: '\u{1F4DD}', service: 'preNeedContracts',
    columns: ['id', 'contract_number', 'client_first_name', 'client_last_name', 'total_amount', 'amount_paid', 'status'],
    fields: [
      { name: 'contract_number', label: 'Contract Number', type: 'text', required: true },
      { name: 'client_first_name', label: 'Client First Name', type: 'text', required: true },
      { name: 'client_last_name', label: 'Client Last Name', type: 'text', required: true },
      { name: 'client_email', label: 'Email', type: 'email' },
      { name: 'client_phone', label: 'Phone', type: 'text' },
      { name: 'client_dob', label: 'Date of Birth', type: 'date' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'contract_date', label: 'Contract Date', type: 'date' },
      { name: 'total_amount', label: 'Total Amount', type: 'number' },
      { name: 'amount_paid', label: 'Amount Paid', type: 'number' },
      { name: 'payment_plan', label: 'Payment Plan', type: 'select', options: ['full','monthly','quarterly','annual'] },
      { name: 'services_included', label: 'Services Included', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active','fulfilled','cancelled','transferred'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'monument-orders': {
    title: 'Monument & Marker Orders', icon: '\u{1F3DB}', service: 'monumentOrders',
    columns: ['id', 'order_number', 'deceased_name', 'marker_type', 'vendor', 'cost', 'status'],
    fields: [
      { name: 'order_number', label: 'Order Number', type: 'text' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'deceased_name', label: 'Deceased Name', type: 'text' },
      { name: 'marker_type', label: 'Marker Type', type: 'select', options: ['headstone','flat_marker','monument','bench','plaque','veteran_marker'] },
      { name: 'material', label: 'Material', type: 'text' },
      { name: 'inscription', label: 'Inscription', type: 'textarea' },
      { name: 'vendor', label: 'Vendor', type: 'text' },
      { name: 'order_date', label: 'Order Date', type: 'date' },
      { name: 'expected_delivery', label: 'Expected Delivery', type: 'date' },
      { name: 'installation_date', label: 'Installation Date', type: 'date' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['ordered','in_production','delivered','installed','cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'perpetual-care-funds': {
    title: 'Perpetual Care Fund', icon: '\u{1F4B0}', service: 'perpetualCareFunds',
    columns: ['id', 'fund_name', 'contributor_name', 'contribution_amount', 'current_balance', 'status'],
    fields: [
      { name: 'fund_name', label: 'Fund Name', type: 'text', required: true },
      { name: 'account_number', label: 'Account Number', type: 'text' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'contributor_name', label: 'Contributor', type: 'text' },
      { name: 'contribution_amount', label: 'Contribution Amount', type: 'number' },
      { name: 'contribution_date', label: 'Contribution Date', type: 'date' },
      { name: 'current_balance', label: 'Current Balance', type: 'number' },
      { name: 'interest_rate', label: 'Interest Rate (%)', type: 'number' },
      { name: 'last_disbursement', label: 'Last Disbursement Date', type: 'date' },
      { name: 'disbursement_amount', label: 'Disbursement Amount', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['active','depleted','frozen'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'grounds-maintenance': {
    title: 'Grounds Maintenance', icon: '\u{1F33F}', service: 'groundsMaintenance',
    columns: ['id', 'task_name', 'section', 'task_type', 'scheduled_date', 'assigned_to', 'priority', 'status'],
    fields: [
      { name: 'task_name', label: 'Task Name', type: 'text', required: true },
      { name: 'section', label: 'Section', type: 'text' },
      { name: 'task_type', label: 'Task Type', type: 'select', options: ['mowing','trimming','planting','irrigation','snow_removal','leaf_cleanup','fertilizing','pest_control','general'] },
      { name: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
      { name: 'completed_date', label: 'Completed Date', type: 'date' },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low','medium','high','urgent'] },
      { name: 'estimated_hours', label: 'Estimated Hours', type: 'number' },
      { name: 'actual_hours', label: 'Actual Hours', type: 'number' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled','in_progress','completed','cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'flower-placements': {
    title: 'Flower Placements', icon: '\u{1F490}', service: 'flowerPlacements',
    columns: ['id', 'deceased_name', 'placed_by', 'flower_type', 'placement_date', 'occasion', 'status'],
    fields: [
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'deceased_name', label: 'Deceased Name', type: 'text' },
      { name: 'placed_by', label: 'Placed By', type: 'text' },
      { name: 'flower_type', label: 'Flower Type', type: 'text' },
      { name: 'arrangement_type', label: 'Arrangement', type: 'select', options: ['bouquet','wreath','spray','potted','artificial','standing'] },
      { name: 'placement_date', label: 'Placement Date', type: 'date' },
      { name: 'removal_date', label: 'Removal Date', type: 'date' },
      { name: 'occasion', label: 'Occasion', type: 'text' },
      { name: 'vendor', label: 'Vendor', type: 'text' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['placed','wilted','removed','permanent'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'ceremony-schedules': {
    title: 'Chapel & Ceremony Scheduling', icon: '\u26EA', service: 'ceremonySchedules',
    columns: ['id', 'event_name', 'event_type', 'venue', 'scheduled_date', 'start_time', 'status'],
    fields: [
      { name: 'event_name', label: 'Event Name', type: 'text', required: true },
      { name: 'event_type', label: 'Event Type', type: 'select', options: ['funeral','memorial','celebration_of_life','graveside','committal','wake','other'] },
      { name: 'venue', label: 'Venue', type: 'select', options: ['main_chapel','small_chapel','graveside','mausoleum','garden','reception_hall'] },
      { name: 'scheduled_date', label: 'Date', type: 'date', required: true },
      { name: 'start_time', label: 'Start Time', type: 'time' },
      { name: 'end_time', label: 'End Time', type: 'time' },
      { name: 'deceased_name', label: 'Deceased Name', type: 'text' },
      { name: 'contact_name', label: 'Contact Name', type: 'text' },
      { name: 'contact_phone', label: 'Contact Phone', type: 'text' },
      { name: 'expected_attendees', label: 'Expected Attendees', type: 'number' },
      { name: 'officiant', label: 'Officiant', type: 'text' },
      { name: 'special_requirements', label: 'Special Requirements', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled','confirmed','completed','cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'vendors': {
    title: 'Vendor Management', icon: '\u{1F91D}', service: 'vendors',
    columns: ['id', 'company_name', 'vendor_type', 'contact_name', 'phone', 'rating', 'status'],
    fields: [
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'vendor_type', label: 'Vendor Type', type: 'select', options: ['vault','florist','monument','casket','urn','catering','landscaping','transportation','other'] },
      { name: 'contact_name', label: 'Contact Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'license_number', label: 'License Number', type: 'text' },
      { name: 'insurance_expiry', label: 'Insurance Expiry', type: 'date' },
      { name: 'contract_start', label: 'Contract Start', type: 'date' },
      { name: 'contract_end', label: 'Contract End', type: 'date' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['active','inactive','suspended','pending'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'compliance-records': {
    title: 'Compliance & Regulations', icon: '\u2696', service: 'complianceRecords',
    columns: ['id', 'regulation_name', 'regulation_type', 'compliance_status', 'last_audit_date', 'next_audit_date'],
    fields: [
      { name: 'regulation_name', label: 'Regulation Name', type: 'text', required: true },
      { name: 'regulation_type', label: 'Type', type: 'select', options: ['state','federal','local','environmental','health','osha'] },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'compliance_status', label: 'Status', type: 'select', options: ['compliant','non_compliant','pending_review','under_remediation'] },
      { name: 'last_audit_date', label: 'Last Audit', type: 'date' },
      { name: 'next_audit_date', label: 'Next Audit', type: 'date' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'documentation_path', label: 'Documentation Path', type: 'text' },
      { name: 'corrective_action', label: 'Corrective Action', type: 'textarea' },
      { name: 'fine_amount', label: 'Fine Amount ($)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'memorial-events': {
    title: 'Memorial Events', icon: '\u{1F56F}', service: 'memorialEvents',
    columns: ['id', 'event_name', 'event_type', 'event_date', 'location', 'expected_attendees', 'status'],
    fields: [
      { name: 'event_name', label: 'Event Name', type: 'text', required: true },
      { name: 'event_type', label: 'Event Type', type: 'select', options: ['memorial_day','veterans_day','holiday','anniversary','community','fundraiser','tour','other'] },
      { name: 'event_date', label: 'Event Date', type: 'date', required: true },
      { name: 'start_time', label: 'Start Time', type: 'time' },
      { name: 'end_time', label: 'End Time', type: 'time' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'organizer', label: 'Organizer', type: 'text' },
      { name: 'expected_attendees', label: 'Expected Attendees', type: 'number' },
      { name: 'budget', label: 'Budget ($)', type: 'number' },
      { name: 'actual_cost', label: 'Actual Cost ($)', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['planning','confirmed','completed','cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'genealogy-records': {
    title: 'Genealogy Records', icon: '\u{1F333}', service: 'genealogyRecords',
    columns: ['id', 'person_name', 'birth_date', 'death_date', 'spouse_name', 'occupation'],
    fields: [
      { name: 'person_name', label: 'Person Name', type: 'text', required: true },
      { name: 'birth_date', label: 'Birth Date', type: 'date' },
      { name: 'death_date', label: 'Death Date', type: 'date' },
      { name: 'birth_place', label: 'Birth Place', type: 'text' },
      { name: 'death_place', label: 'Death Place', type: 'text' },
      { name: 'father_name', label: 'Father Name', type: 'text' },
      { name: 'mother_name', label: 'Mother Name', type: 'text' },
      { name: 'spouse_name', label: 'Spouse Name', type: 'text' },
      { name: 'children', label: 'Children', type: 'textarea' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'burial_record_id', label: 'Burial Record ID', type: 'number' },
      { name: 'occupation', label: 'Occupation', type: 'text' },
      { name: 'military_service', label: 'Military Service', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'payment-plans': {
    title: 'Payment Plans', icon: '\u{1F4B3}', service: 'paymentPlans',
    columns: ['id', 'plan_number', 'client_name', 'total_amount', 'total_paid', 'remaining_balance', 'status'],
    fields: [
      { name: 'plan_number', label: 'Plan Number', type: 'text' },
      { name: 'client_name', label: 'Client Name', type: 'text', required: true },
      { name: 'client_email', label: 'Email', type: 'email' },
      { name: 'client_phone', label: 'Phone', type: 'text' },
      { name: 'deed_id', label: 'Deed ID', type: 'number' },
      { name: 'total_amount', label: 'Total Amount', type: 'number', required: true },
      { name: 'down_payment', label: 'Down Payment', type: 'number' },
      { name: 'monthly_payment', label: 'Monthly Payment', type: 'number' },
      { name: 'total_paid', label: 'Total Paid', type: 'number' },
      { name: 'remaining_balance', label: 'Remaining Balance', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'payment_frequency', label: 'Frequency', type: 'select', options: ['weekly','bi_weekly','monthly','quarterly'] },
      { name: 'status', label: 'Status', type: 'select', options: ['active','paid_off','delinquent','cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'cremation-niches': {
    title: 'Cremation & Columbarium', icon: '\u{1F3FA}', service: 'cremationNiches',
    columns: ['id', 'niche_number', 'columbarium_name', 'size', 'status', 'occupant_name', 'price'],
    fields: [
      { name: 'niche_number', label: 'Niche Number', type: 'text', required: true },
      { name: 'columbarium_name', label: 'Columbarium', type: 'text' },
      { name: 'level', label: 'Level', type: 'text' },
      { name: 'position', label: 'Position', type: 'text' },
      { name: 'size', label: 'Size', type: 'select', options: ['single','double','family'] },
      { name: 'status', label: 'Status', type: 'select', options: ['available','sold','occupied','reserved'] },
      { name: 'occupant_name', label: 'Occupant Name', type: 'text' },
      { name: 'date_of_inurnment', label: 'Date of Inurnment', type: 'date' },
      { name: 'urn_type', label: 'Urn Type', type: 'text' },
      { name: 'price', label: 'Price ($)', type: 'number' },
      { name: 'owner_name', label: 'Owner Name', type: 'text' },
      { name: 'owner_phone', label: 'Owner Phone', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'veteran-records': {
    title: 'Veteran Section Management', icon: '\u{1F1FA}\u{1F1F8}', service: 'veteranRecords',
    columns: ['id', 'veteran_name', 'branch', 'rank', 'war_conflict', 'date_of_death'],
    fields: [
      { name: 'veteran_name', label: 'Veteran Name', type: 'text', required: true },
      { name: 'service_number', label: 'Service Number', type: 'text' },
      { name: 'branch', label: 'Branch', type: 'select', options: ['army','navy','air_force','marines','coast_guard','space_force','national_guard'] },
      { name: 'rank', label: 'Rank', type: 'text' },
      { name: 'war_conflict', label: 'War/Conflict', type: 'text' },
      { name: 'enlistment_date', label: 'Enlistment Date', type: 'date' },
      { name: 'discharge_date', label: 'Discharge Date', type: 'date' },
      { name: 'discharge_type', label: 'Discharge Type', type: 'text' },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
      { name: 'date_of_death', label: 'Date of Death', type: 'date' },
      { name: 'plot_id', label: 'Plot ID', type: 'number' },
      { name: 'va_claim_number', label: 'VA Claim Number', type: 'text' },
      { name: 'headstone_type', label: 'Headstone Type', type: 'text' },
      { name: 'flag_holder', label: 'Flag Holder', type: 'select', options: ['true','false'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'deed-transfers': {
    title: 'Deed Transfers', icon: '\u{1F501}', service: 'deedTransfers',
    columns: ['id', 'transfer_number', 'from_owner', 'to_owner', 'transfer_date', 'transfer_type', 'status'],
    fields: [
      { name: 'deed_id', label: 'Deed ID', type: 'number' },
      { name: 'transfer_number', label: 'Transfer Number', type: 'text' },
      { name: 'from_owner', label: 'From Owner', type: 'text', required: true },
      { name: 'to_owner', label: 'To Owner', type: 'text', required: true },
      { name: 'to_owner_email', label: 'New Owner Email', type: 'email' },
      { name: 'to_owner_phone', label: 'New Owner Phone', type: 'text' },
      { name: 'transfer_date', label: 'Transfer Date', type: 'date' },
      { name: 'transfer_type', label: 'Transfer Type', type: 'select', options: ['sale','inheritance','gift','court_order'] },
      { name: 'transfer_fee', label: 'Transfer Fee ($)', type: 'number' },
      { name: 'legal_document', label: 'Legal Document', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending','approved','completed','rejected'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  }
};

function formatColumnHeader(col) {
  return col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatCellValue(value, col) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';
  if (col === 'price' || col === 'cost' || col === 'total_amount' || col === 'amount_paid' ||
      col === 'remaining_balance' || col === 'total_paid' || col === 'purchase_price' ||
      col === 'contribution_amount' || col === 'current_balance' || col === 'monthly_payment' ||
      col === 'down_payment' || col === 'budget' || col === 'actual_cost' || col === 'transfer_fee' ||
      col === 'disbursement_amount' || col === 'fine_amount') {
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
  return String(value);
}

function FeaturePage({ user, onLogout }) {
  const { featureKey } = useParams();
  const navigate = useNavigate();
  const config = featureConfig[featureKey];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  const service = apiServices[config?.service];

  const fetchData = useCallback(async () => {
    if (!service) return;
    setLoading(true);
    try {
      const res = await service.getAll();
      setData(res.data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!config) return <div className="feature-page"><h2>Feature not found</h2></div>;

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleNew = () => {
    setFormData({});
    setEditMode(false);
    setShowForm(true);
  };

  const handleEdit = () => {
    setFormData({ ...selectedItem });
    setEditMode(true);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await service.delete(selectedItem.id);
      setShowDetail(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert boolean string fields
      const cleanData = { ...formData };
      config.fields.forEach(f => {
        if (f.type === 'select' && (f.options?.includes('true'))) {
          if (cleanData[f.name] === 'true') cleanData[f.name] = true;
          else if (cleanData[f.name] === 'false') cleanData[f.name] = false;
        }
        if (f.type === 'number' && cleanData[f.name] === '') {
          delete cleanData[f.name];
        }
      });
      if (editMode) {
        await service.update(formData.id, cleanData);
      } else {
        await service.create(cleanData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <header className="header">
        <div className="header-left">
          <div className="header-logo">&#9773; Eternal Rest Memorial Park</div>
        </div>
        <div className="header-right">
          <span className="user-info">{user?.first_name} {user?.last_name}</span>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </header>

      <div className="feature-page">
        <div className="page-header">
          <div className="page-header-left">
            <button className="btn-back" onClick={() => navigate('/')}>&#8592;</button>
            <span className="page-icon">{config.icon}</span>
            <h1 className="page-title">{config.title}</h1>
            <span className="badge-count">{data.length} records</span>
          </div>
          <button className="btn btn-accent" onClick={handleNew}>+ New Record</button>
        </div>

        <div className="table-container">
          <div className="table-overflow">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : data.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No records found</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    {config.columns.map(col => (
                      <th key={col}>{formatColumnHeader(col)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id} onClick={() => handleRowClick(item)}>
                      {config.columns.map(col => (
                        <td key={col}>
                          {(col === 'status' || col === 'compliance_status') ? (
                            <span className={`status-badge status-${item[col]}`}>{formatCellValue(item[col], col)}</span>
                          ) : formatCellValue(item[col], col)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{config.icon} Record Details</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {config.fields.map(field => (
                  <div key={field.name} className={`detail-item ${field.type === 'textarea' ? 'full-width' : ''}`}>
                    <div className="detail-label">{field.label}</div>
                    <div className="detail-value">
                      {(field.name === 'status' || field.name === 'compliance_status') ? (
                        <span className={`status-badge status-${selectedItem[field.name]}`}>
                          {formatCellValue(selectedItem[field.name], field.name)}
                        </span>
                      ) : formatCellValue(selectedItem[field.name], field.name)}
                    </div>
                  </div>
                ))}
                <div className="detail-item">
                  <div className="detail-label">Record ID</div>
                  <div className="detail-value">{selectedItem.id}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Created</div>
                  <div className="detail-value">{new Date(selectedItem.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
              <button className="btn btn-accent btn-sm" onClick={handleEdit}>Edit</button>
              <button className="btn btn-outline btn-sm" onClick={() => setShowDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editMode ? 'Edit' : 'New'} {config.title}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  {config.fields.map(field => (
                    <div key={field.name} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`} style={field.type === 'textarea' ? {gridColumn: '1/-1'} : {}}>
                      <label>{field.label}{field.required ? ' *' : ''}</label>
                      {field.type === 'select' ? (
                        <select
                          value={formData[field.name] || ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                        >
                          <option value="">Select...</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.name] || ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.name] || ''}
                          onChange={e => handleFieldChange(field.name, e.target.value)}
                          required={field.required}
                          step={field.type === 'number' ? 'any' : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-success btn-sm">{editMode ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeaturePage;
