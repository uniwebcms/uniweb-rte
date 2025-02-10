import Cite from 'citation-js';
import './csl.css';
import chicago from './styles/chicago-fullnote-bibliography.csl';
import mla from './styles/mla.csl';

let config = Cite.plugins.config.get('@csl');

config.templates.add('chicago', chicago);
config.templates.add('mla', mla);

export default Cite;
