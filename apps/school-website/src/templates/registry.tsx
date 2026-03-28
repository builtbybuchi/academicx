import type { ComponentType } from 'react';
import type { TemplateId } from '@/types/school-data';
import { Template1 } from './Template1';
import { Template2 } from './Template2';
import { Template3 } from './Template3';
import { Template4 } from './Template4';
import { Template5 } from './Template5';
import { Template6 } from './Template6';

export const TEMPLATES: Record<TemplateId, ComponentType> = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
    template4: Template4,
    template5: Template5,
    template6: Template6,
};
