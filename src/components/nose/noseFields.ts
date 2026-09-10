// Nose attribute keys. Plain data, no component imports: the sidebar reads these and
// TastingPhaseLayout imports the sidebar, so a phase-client import here closes a cycle.

// Single-answer categories. Drives chip shape on the Nose page (segmented rect
// rather than pill) and label pairing in the Final Conclusion recap.
export const NOSE_ASSESSMENTS = new Set([
	'Clean or Faulty',
	'Intensity',
	'Age Assessment',
	'Fruit Character',
	'Condition',
	'Wood Aromas Origin',
	'Wood Aromas Condition',
]);
