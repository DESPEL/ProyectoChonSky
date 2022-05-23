import { GrammarFreeLanguage } from './class/GLC.js'
import { GLCToPushdownTransformation } from './class/GLCToPushdown.js'


const testVars = ['S', 'S', 'T', 'T']

const testRules = ['aTb', 'b', 'aT', 'ϵ']


new GLCToPushdownTransformation(new GrammarFreeLanguage(testVars, testRules))