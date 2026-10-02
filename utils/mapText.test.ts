import {expect,it} from 'vitest';
import {escapeMapText} from './mapText';
it('renders edited place text without interpreting HTML',()=>expect(escapeMapText('<img src=x onerror="alert(1)"> & honden')).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; honden'));
