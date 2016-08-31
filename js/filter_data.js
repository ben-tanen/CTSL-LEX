filter_data = {
    // FREQUENCY PROPERTIES
    'ASL Sign Frequency (M)': {
        valueA: null,
	    valueB: null,
        type:   'continuous',
        min:    1,
        max:    7,
    }, 'ASL Sign Frequency (Z)': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    -4,
        max:    4,

    // PHONOLOGICAL PROPERTIES
    }, 'CTSL Selected Fingers': {
        values:  ['index', 'middle', 'ring', 'pinky', 'thumb'],
        allowed: [ ],
        type:    'categorical',
    }, 'CTSL Flexion': {
        values:  ['1', '2', '3', '4', '5', '6', '7', 'Stacked', 'Crossed'],
        allowed: [ ],
        type:    'categorical',
    }, 'CTSL Path Movement': {
        values:  ['Straight', 'Curved', 'BackAndForth', 'Circular', 'None', 'Other'],
        allowed: [ ],
        type:    'categorical',
    }, 'CTSL Major Location': {
        values:  ['Head', 'Arm', 'Body', 'Hand', 'Neutral', 'Other'],
        allowed: [ ],
        type:    'categorical',
    }, 'ASL Selected Fingers': {
        values:  ['index', 'middle', 'ring', 'pinky', 'thumb'],
        allowed: [ ],
        type:    'categorical',
    }, 'ASL Flexion': {
        values:  ['1', '2', '3', '4', '5', '6', '7', 'Stacked', 'Crossed'],
        allowed: [ ],
        type:    'categorical',
    }, 'ASL Path Movement': {
        values:  ['Straight', 'Curved', 'BackAndForth', 'Circular', 'None', 'Other'],
        allowed: [ ],
        type:    'categorical',
    }, 'ASL Major Location': {
        values:  ['Head', 'Arm', 'Body', 'Hand', 'Neutral', 'Other'],
        allowed: [ ],
        type:    'categorical',
    }, 'ASL Minor Location': {
        values:  ['HeadTop' , 'Forehead', 'Eye', 'CheekNose', 'UpperLip', 'Mouth', 'Chin', 'UnderChin', 'UpperArm', 'ElbowFront', 'ElbowBack', 'ForearmBack', 'ForearmFront', 'ForearmUlnar', 'WristBack', 'WristFront', 'Neck', 'Shoulder', 'Clavicle', 'TorsoTop', 'TorsoMid', 'TorsoBottom', 'Waist', 'Hips', 'Palm', 'FingerFront', 'PalmBack', 'FingerBack', 'FingerRadial', 'FingerUlnar', 'FingerTip', 'Heel', 'Other', 'Neutral'],
        allowed: [ ],
        type:    'categorical',
    }, 'ASL Sign Type': {
        values:  ['OneHanded', 'SymmetricalOrAlternating', 'AsymmetricalSameHandshape', 'AsymmetricalDifferentHandshape'],
        allowed: [ ],
        type:    'categorical',

    // ICONICITY PROPERTIES
    }, 'CTSL Turkish Iconicity (M)': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    1,
        max:    7,
    }, 'CTSL Turkish Iconicity (Z)': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    -4,
        max:    4,
    }, 'CTSL American Iconicity (M)': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    1,
        max:    7,
    }, 'CTSL American Iconicity (Z)': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    -4,
        max:    4,
    }, 'ASL Iconicity (M)': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    1,
        max:    7,
    }, 'ASL Iconicity (Z)': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    -4,
        max:    4,

    // LEXICAL PROPERTIES
    }, 'ASL Lexical Class': {
        values: ['Adjective', 'Adverb', 'Minor', 'Name', 'Noun', 'Number', 'Verb'],
        allowed: [ ],
        type:    'categorical',
    }, 'ASL Initialized': {
        type:   'boolean',
        value:  null,
    }, 'ASL Compound': {
        type:   'boolean',
        value:  null,
    }, 'ASL Fingerspelled Loan Sign': {
        type:   'boolean',
        value:  null,

    // NEIGHBORHOOD DENSITY
    }, 'CTSL Parameter Based Neighborhood Density': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    0,
        max:    1000,
    }, 'ASL Parameter Based Neighborhood Density': {
        valueA: null,
        valueB: null,
        type:   'continuous',
        min:    0,
        max:    1000,
    },
};

