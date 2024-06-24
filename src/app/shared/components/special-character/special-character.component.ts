import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ButtonPurpose } from '@mhe/ngx-shared';
import { ButtonType } from '@mhe/ngx-shared';
import { SpecialCharactersService } from '../../../services/special-characters/special-characters.service';

@Component({
  selector: 'app-special-character',
  templateUrl: './special-character.component.html',
  styleUrls: ['./special-character.component.scss'],
})
export class SpecialCharacterComponent implements OnInit {
  _buttonPurpose = ButtonPurpose;
  buttonType = ButtonType;
  tabIndex = 0;
  @Output()
  close = new EventEmitter();

  positionValue: any;

  tinyInstance;

  defaultCharMap = [
    {
      name: 'Symbols',
      characters: [
        ['\u2122', 'Trade Mark Sign'],
        ['\u0192', 'Latin Small Letter F with Hook'],
        ['\u00A4', 'Currency Sign'],
        ['\u25CA', 'Lozenge'],
        ['\u2261', 'Identical To'],
        ['\u00A3', 'Currency Pound Sign'],
        ['\u00A2', 'Currency Cent Sign'],
        ['\u005F', 'Low Line'],
        ['\u201D', 'Right Double Quotation Mark'],
        ['\u2018', 'Left Single Quotation Mark'],
        ['\u2019', 'Right Single Quotation Mark'],
        ['\u201B', 'Single High Reversed Quotation Mark'],
        ['\u201F', 'Double High Reversed Quotation Mark'],
        ['\u201E', 'Double Low Quotation Mark'],
        ['\u00B0', 'Degree Sign'],
        ['\u2237', 'Combining Diaeresis'],
        ['\u2035', 'Reversed Prime'],
        ['\u2026', 'Horizontal Ellipsis'],
        ['\u00AF', 'Macron'],
        ['\u0332', 'Combining Low Line'],
        ['\u00A7', 'Section Sign'],
        ['\u00B6', 'Pilcrow Sign'],
        ['\u2020', 'Dagger'],
        ['\u2021', 'Double Dagger'],
        ['\u0040', 'Commercial At'],
        ['\u2030', 'Per mille Sign'],
        ['\u2031', 'Per Ten Thousand Sign'],
        ['\u00A6', 'Broken Bar'],
        ['\u002F', 'Solidus'],
        ['\u005C', 'Reverse Solidus'],
        ['\u2014', 'Em Dash'],
        ['\u0336', 'Combining Long Stroke Overlay'],
        ['\u00A9', 'Copyright Sign'],
        ['\u00A5', 'Yen Sign'],
        ['\u00AE', 'Registered Sign'],
        ['\u00B1', 'Plus-Minus Sign'],
        ['\u00BF', 'Inverted Question Mark'],
        ['\u266B', 'Beamed Eight Notes'],
        ['\u260E', 'Black Telephone'],
        ['\u00A1', 'Inverted Exclamation Mark'],
        ['\u20AC', 'Euro Sign'],
      ],
    },
    {
      name: 'Math',
      characters: [
        ['\u002B', 'Plus Sign'],
        ['\u002D', 'Hyphen-Minus'],
        ['\u00D7', 'Multiplication Sign'],
        ['\u00F7', 'Division Sign'],
        ['\u00B1', 'Plus-Minus Sign'],
        ['\u003C', 'Less-Than Sign'],
        ['\u003E', 'Greater-Than Sign'],
        ['\u003D', 'Equals Sign'],
        ['\u2260', 'Not Equal To'],
        ['\u2264', 'Less-Than or Equal To'],
        ['\u2265', 'Greater-Than or Equal To'],
        ['\u2245', 'Approximately Equal To'],
        ['\u2249', 'Not Almost Equal To'],
        ['\u03C0', 'Greek Small Letter Pi'],
        ['\u223C', 'Tilde Operator'],
        ['\u2248', 'Almost Equal To'],
        ['\u221E', 'Infinity'],
        ['\u002F', 'Solidus'],
        ['\u00B0', 'Degree Sign'],
        ['\u221D', 'Proportional To'],
        ['\u221A', 'Square Root'],
        ['\u00BC', 'Vulgar Fraction One Quarter'],
        ['\u00BD', 'Vulgar Fraction One Half'],
        ['\u00BE', 'Vulgar Fraction Three Quarters'],
        ['\u22C5', 'Dot Operator'],
        ['\u212F', 'Script Small E'],
        ['\u2190', 'Leftwards Arrow'],
        ['\u2191', 'Upwards Arrow'],
        ['\u2192', 'Rightwards Arrow'],
        ['\u2193', 'Downwards Arrow'],
        ['\u2194', 'Left Right Arrow'],
        ['\u2195', 'Up Down Arrow'],
        ['\u2202', 'Partial Differential'],
      ],
    },
    {
      name: 'Greek',
      characters: [
        ['\u03b1', 'alpha'],
        ['\u03b2', 'beta'],
        ['\u03b3', 'gamma'],
        ['\u03b4', 'delta'],
        ['\u03b5', 'epsilon'],
        ['\u03b6', 'zeta'],
        ['\u03b7', 'eta'],
        ['\u03b8', 'theta'],
        ['\u03b9', 'iota'],
        ['\u03ba', 'kappa'],
        ['\u03bb', 'lambda'],
        ['\u03bc', 'mu'],
        ['\u03bd', 'nu'],
        ['\u03be', 'xi'],
        ['\u03bf', 'omicron'],
        ['\u03c0', 'pi'],
        ['\u03c1', 'rho'],
        ['\u03c3', 'sigma'],
        ['\u03c4', 'tau'],
        ['\u03c5', 'upsilon'],
        ['\u03c6', 'phi'],
        ['\u03c7', 'chi'],
        ['\u03c8', 'psi'],
        ['\u03c9', 'omega'],
        ['\u03D5', 'phi symbol'],
        ['\u0391', 'Alpha'],
        ['\u0392', 'Beta'],
        ['\u0393', 'Gamma'],
        ['\u0394', 'Delta'],
        ['\u0395', 'Epsilon'],
        ['\u0396', 'Zeta'],
        ['\u0397', 'Eta'],
        ['\u0398', 'Theta'],
        ['\u0399', 'Iota'],
        ['\u039a', 'Kappa'],
        ['\u039b', 'Lambda'],
        ['\u039c', 'Mu'],
        ['\u039d', 'Nu'],
        ['\u039e', 'Xi'],
        ['\u039f', 'Omicron'],
        ['\u03a0', 'Pi'],
        ['\u03a1', 'Rho'],
        ['\u03a3', 'Sigma'],
        ['\u03a4', 'Tau'],
        ['\u03a5', 'Upsilon'],
        ['\u03a6', 'Phi'],
        ['\u03a7', 'Chi'],
        ['\u03a8', 'Psi'],
        ['\u03a9', 'Omega'],
        ['\u03D5', 'Phi Symbol'],
      ],
    },
    {
      name: 'World Languages',
      characters: [
        ['\u00E0', 'a Grave'],
        ['\u00E1', 'a Acute'],
        ['\u00E2', 'a Circumflex'],
        ['\u00E3', 'a Tilde'],
        ['\u00E4', 'a Diaeresis'],
        ['\u00E5', 'a Ring Above'],
        ['\u00E6', 'Ligature ae'],
        ['\u00E7', 'c Cedilla'],
        ['\u010D', 'c Caron'],
        ['\u00E9', 'e Acute'],
        ['\u00E8', 'e Grave'],
        ['\u00EA', 'e Circumflex'],
        ['\u00EB', 'e Diaeresis'],
        ['\u00ED', 'i Acute'],
        ['\u00EC', 'i Grave'],
        ['\u00EE', 'i Circumflex'],
        ['\u00EF', 'i Diaeresis'],
        ['\u00F1', 'n Tilde'],
        ['\u00F3', 'o Acute'],
        ['\u00F2', 'o Grave'],
        ['\u00F4', 'o Circumflex'],
        ['\u00F6', 'o Diaeresis'],
        ['\u00F5', 'o Tilde'],
        ['\u00F8', 'o Stroke'],
        ['\u0153', 'Ligature oe'],
        ['\u0159', 'r Caron'],
        ['\u015D', 's Circumflex'],
        ['\u0161', 's Caron'],
        ['\u1E61', 's Dot Above'],
        ['\u00DF', 's Sharp'],
        ['\u00FA', 'u Acute'],
        ['\u00F9', 'u Grave'],
        ['\u00FB', 'u Circumflex'],
        ['\u00FC', 'u Diaeresis'],
        ['\u00FD', 'y Acute'],
        ['\u00FF', 'y Diaeresis'],
        ['\u0177', 'y Circumflex'],
        ['\u017E', 'z Caron'],
        ['\u00C0', 'A Grave'],
        ['\u00C1', 'A Acute'],
        ['\u00C2', 'A Circumflex'],
        ['\u00C3', 'A Tilde'],
        ['\u00C4', 'A Diaeresis'],
        ['\u00C5', 'A Ring Above'],
        ['\u00C6', 'Ligature Ae'],
        ['\u00C7', 'C Cedilla'],
        ['\u010C', 'C Caron'],
        ['\u00C9', 'E Acute'],
        ['\u00C8', 'E Grave'],
        ['\u00CA', 'E Circumflex'],
        ['\u00CB', 'E Diaeresis'],
        ['\u00CD', 'I Acute'],
        ['\u00CC', 'I Grave'],
        ['\u00CE', 'I Circumflex'],
        ['\u00CF', 'I Diaeresis'],
        ['\u00D1', 'N Tilde'],
        ['\u00D3', 'O Acute'],
        ['\u00D2', 'O Grave'],
        ['\u00D4', 'O Circumflex'],
        ['\u00D6', 'O Diaeresis'],
        ['\u00D5', 'O Tilde'],
        ['\u00D8', 'O Stroke'],
        ['\u0152', 'Ligature Oe'],
        ['\u0158', 'R Caron'],
        ['\u015C', 'S Circumflex'],
        ['\u0160', 'S Caron'],
        ['\u1E60', 'S Dot Above'],
        ['\u1E9E', 'S Sharp'],
        ['\u00DA', 'U Acute'],
        ['\u00D9', 'U Grave'],
        ['\u00DB', 'U Circumflex'],
        ['\u00DC', 'U Diaeresis'],
        ['\u00DD', 'Y Acute'],
        ['\u0178', 'Y Diaeresis'],
        ['\u0176', 'Y Circumflex'],
        ['\u017D', 'Z Caron'],
      ],
    },
  ];
  constructor(public specialCharService: SpecialCharactersService) {
    this.specialCharService.getStatus().subscribe((val) => {
      if (val !== false) {
        this.position();
      }
    });
  }

  ngOnInit(): void {}

  insertCharInTinyMceEditor(char) {
    this.specialCharService.editor.execCommand('mceInsertContent', false, char);
  }

  onClose() {
    this.specialCharService.hide();
  }

  tabClick(newIndex) {
    this.tabIndex = newIndex;
  }

  onClickedOutside($event) {
    this.onClose();
  }

  position() {
    const editor = this.specialCharService.editor.editorContainer;
    const rectValue = editor.getBoundingClientRect();
    const modalH = editor.ownerDocument.documentElement.offsetHeight;
    const heightToCheck = rectValue.top + rectValue.height + 327;
    if (modalH < heightToCheck) {
      this.positionValue = { x: rectValue.left, y: rectValue.top - 337 };
    } else {
      this.positionValue = { x: rectValue.left, y: rectValue.top + rectValue.height };
    }
  }
}
