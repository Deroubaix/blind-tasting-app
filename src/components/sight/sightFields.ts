// Attribute keys as stored in `tastingData.sight`. The appearance fields double as their
// own labels; the camelCase evidence keys do not, so their labels live here — the Final
// Conclusion recap needs the same strings to name the values it reads back.

export const SIGHT_MAIN_FIELDS = ['Clarity', 'Brightness', 'Concentration', 'Viscosity', 'Color', 'Hue'];

export const SIGHT_EVIDENCE_LABELS: Record<string, string> = {
	StainedTears: 'Stained Tears',
	GasEvidence: 'Gas Evidence',
	SedimentParticles: 'Sediment/Particles',
};

// Answers meaning "nothing observed" — filtered out of the evidence summary.
export const SIGHT_EVIDENCE_ABSENT = ['No', 'None'];
