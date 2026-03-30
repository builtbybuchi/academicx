import type { ComponentType } from 'react';
import type { TemplateId } from '@/types/school-data';
import { Template1 } from './Template1';
import { Template2 } from './Template2';
import { Template3 } from './Template3';
import { Template4 } from './Template4';
import { Template5 } from './Template5';
import { Template6 } from './Template6';
import { Template7 } from './Template7';
import { Template8 } from './Template8';
import { Template9 } from './Template9';
import { Template10 } from './Template10';

export const TEMPLATES: Record<TemplateId, ComponentType> = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
    template4: Template4,
    template5: Template5,
    template6: Template6,
    template7: Template7,
    template8: Template8,
    template9: Template9,
    template10: Template10,
};
