import React from 'react';
import {
    Dumbbell,
    Apple,
    Activity,
    Footprints,
    Moon,
    Heart,
    Weight,
    Droplets,
    ChevronRight
} from 'lucide-react';

const attributeIconMap = {
    'workout': Dumbbell,
    'workout logging': Dumbbell,
    'calorie': Apple,
    'calorie intake': Apple,
    'calorie intake logging': Apple,
    'blood pressure': Activity,
    'blood pressure logging': Activity,
    'steps': Footprints,
    'steps logging': Footprints,
    'sleep': Moon,
    'sleep management': Moon,
    'sleep management logging': Moon,
    'heart': Heart,
    'heart beat': Heart,
    'heart beat logging': Heart,
    'weight': Weight,
    'daily weight': Weight,
    'daily weight logging': Weight,
    'water': Droplets,
    'water intake': Droplets,
    'water intake logging': Droplets,
};

const getAttributeIcon = (attribute) => {
    if (!attribute) {
        return <ChevronRight className="w-6 h-6 text-white" />;
    }

    const attributeName = (
        attribute.display_name ||
        attribute.name ||
        attribute.title ||
        attribute.label ||
        ''
    ).toLowerCase().trim();

    let IconComponent = null;

    if (attributeIconMap[attributeName]) {
        IconComponent = attributeIconMap[attributeName];
    } else {
        for (const [key, Icon] of Object.entries(attributeIconMap)) {
            if (attributeName.includes(key)) {
                IconComponent = Icon;
                break;
            }
        }
    }

    if (!IconComponent) {
        IconComponent = ChevronRight;
    }

    return <IconComponent className="w-5 h-5 text-white" />;
};

export default getAttributeIcon;