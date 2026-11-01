import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import fontFaces from './portable-font-faces.css?raw';
import './typography.css';
import './styles.css';
import './workspaces/workspaces.css';
// Share one font pack with downloads instead of fetching a second copy for the app.
const fontStyles = document.createElement('style');
fontStyles.textContent = fontFaces;
document.head.append(fontStyles);
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
