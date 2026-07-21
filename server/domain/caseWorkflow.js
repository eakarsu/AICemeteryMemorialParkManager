'use strict';

const STATES = Object.freeze({ intake: ['identity_verified'], identity_verified: ['authorized'], authorized: ['scheduled'], scheduled: ['services_complete', 'on_hold'], on_hold: ['scheduled'], services_complete: ['reconciled'], reconciled: ['closed'], closed: [] });
const APPROVERS = new Set(['manager', 'compliance', 'admin']);

function text(value, field, max = 500) { if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`${field} is required`); return value.trim(); }
function validateCase(input) {
  if (!input || typeof input !== 'object') throw new Error('case must be an object');
  if (!Array.isArray(input.identityEvidence) || input.identityEvidence.length < 2) throw new Error('two independent identity evidence records are required');
  if (!Array.isArray(input.authorizations) || !input.authorizations.length) throw new Error('at least one authorization is required');
  if (input.pricing?.totalCents == null || !Number.isInteger(input.pricing.totalCents) || input.pricing.totalCents < 0) throw new Error('pricing.totalCents must be a non-negative integer');
  return {
    caseNumber: text(input.caseNumber, 'caseNumber', 80), deceasedLegalName: text(input.deceasedLegalName, 'deceasedLegalName', 200),
    identityEvidence: input.identityEvidence, authorizations: input.authorizations,
    plotIdentity: input.plotIdentity || null, schedule: input.schedule || null,
    merchandise: Array.isArray(input.merchandise) ? input.merchandise : [], documents: Array.isArray(input.documents) ? input.documents : [],
    pricing: input.pricing, nextOfKinContact: input.nextOfKinContact || null,
  };
}
function transition(current, next, role, record, note) {
  if (!STATES[current]?.includes(next)) throw new Error(`transition ${current} -> ${next} is not allowed`);
  if (next === 'authorized' && (!APPROVERS.has(role) || !note || note.trim().length < 10)) throw new Error('documented manager/compliance approval is required');
  if (next === 'scheduled' && (!record.plotIdentity || !record.schedule)) throw new Error('plot/remains identity and schedule are required');
  if (next === 'reconciled' && record.pricing.disclosed !== true) throw new Error('pricing disclosure acknowledgement is required');
  return next;
}
module.exports = { STATES, validateCase, transition };
