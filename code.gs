/**
 * Callback for rendering the main card.
 * @return {CardService.Card} The card to show the user.
 */
function onHomepage(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Convert to Unicode', 'ConvertToUnicode')
      .addToUi();
  return null;
}

// -------------------------------------------------------------------------------------

/**
 * Gets the text the user has selected. If there is no selection,
 * this function displays an error message.
 *
 * @return {Array.<string>} The selected text.
 */
function getSelectedText() {
  const selection = DocumentApp.getActiveDocument().getSelection();
  const text = [];
  if (selection) {
    const elements = selection.getSelectedElements();
    for (let i = 0; i < elements.length; ++i) {
      if (elements[i].isPartial()) {
        const element = elements[i].getElement().asText();
        const startIndex = elements[i].getStartOffset();
        const endIndex = elements[i].getEndOffsetInclusive();

        text.push(element.getText().substring(startIndex, endIndex + 1));
      } else {
        const element = elements[i].getElement();
        // Only translate elements that can be edited as text; skip images and
        // other non-text elements.
        if (element.editAsText) {
          const elementText = element.asText().getText();
          // This check is necessary to exclude images, which return a blank
          // text element.
          if (elementText) {
            text.push(elementText);
          }
        }
      }
    }
  }
  if (!text.length) throw new Error('Please select some text.');
  return text.join('\n');
}


/**
 * Replaces the text of the current selection with the provided text, or
 * inserts text at the current cursor location. (There will always be either
 * a selection or a cursor.) If multiple elements are selected, only inserts the
 * translated text in the first element that can contain text and removes the
 * other elements.
 *
 * @param {string} newText The text with which to replace the current selection.
 */
function insertText(newText) {
  const selection = DocumentApp.getActiveDocument().getSelection();
  if (selection) {
    let replaced = false;
    const elements = selection.getSelectedElements();
    if (elements.length === 1 && elements[0].getElement().getType() ===
      DocumentApp.ElementType.INLINE_IMAGE) {
      throw new Error('Can\'t insert text into an image.');
    }
    for (let i = 0; i < elements.length; ++i) {
      if (elements[i].isPartial()) {
        const element = elements[i].getElement().asText();
        const startIndex = elements[i].getStartOffset();
        const endIndex = elements[i].getEndOffsetInclusive();
        element.deleteText(startIndex, endIndex);
        if (!replaced) {
          element.insertText(startIndex, newText);
          replaced = true;
        } else {
          // This block handles a selection that ends with a partial element. We
          // want to copy this partial text to the previous element so we don't
          // have a line-break before the last partial.
          const parent = element.getParent();
          const remainingText = element.getText().substring(endIndex + 1);
          parent.getPreviousSibling().asText().appendText(remainingText);
          // We cannot remove the last paragraph of a doc. If this is the case,
          // just remove the text within the last paragraph instead.
          if (parent.getNextSibling()) {
            parent.removeFromParent();
          } else {
            element.removeFromParent();
          }
        }
      } else {
        const element = elements[i].getElement();
        if (!replaced && element.editAsText) {
          // Only translate elements that can be edited as text, removing other
          // elements.
          element.clear();
          element.asText().setText(newText);
          replaced = true;
        } else {
          // We cannot remove the last paragraph of a doc. If this is the case,
          // just clear the element.
          if (element.getNextSibling()) {
            element.removeFromParent();
          } else {
            element.clear();
          }
        }
      }
    }
  } else {
    const cursor = DocumentApp.getActiveDocument().getCursor();
    const surroundingText = cursor.getSurroundingText().getText();
    const surroundingTextOffset = cursor.getSurroundingTextOffset();

    // If the cursor follows or preceds a non-space character, insert a space
    // between the character and the translation. Otherwise, just insert the
    // translation.
    if (surroundingTextOffset > 0) {
      if (surroundingText.charAt(surroundingTextOffset - 1) !== ' ') {
        newText = ' ' + newText;
      }
    }
    if (surroundingTextOffset < surroundingText.length) {
      if (surroundingText.charAt(surroundingTextOffset) !== ' ') {
        newText += ' ';
      }
    }
    cursor.insertText(newText);
  }
}


// -------------------------------------------------------------------------------------
// common.js https://bsbk.portal.gov.bd/apps/bangla-converter/js/common.js

function ShowDIV(id) {
    if (document.getElementById) { document.getElementById(id).style.display = 'block'; }
    else {
        if (document.layers) { document.id.display = 'block'; }
        else { document.all.id.style.display = 'block'; }
    }
}
function IsBanglaDigit(CUni) {
    if (CUni == '০' || CUni == '১' || CUni == '২' || CUni == '৩' || CUni == '৪' || CUni == '৫' || CUni == '৬' || CUni == '৭' || CUni == '৮' || CUni == '৯')
        return true; return false;
}
function IsBanglaPreKar(CUni) {
    if (CUni == 'ি' || CUni == 'ৈ' || CUni == 'ে')
        return true; return false;
}
function IsBanglaPostKar(CUni) {
    if (CUni == 'া' || CUni == 'ো' || CUni == 'ৌ' || CUni == 'ৗ' || CUni == 'ু' || CUni == 'ূ' || CUni == 'ী' || CUni == 'ৃ')
        return true; return false;
}
function IsBanglaKar(CUni) {
    if (IsBanglaPreKar(CUni) || IsBanglaPostKar(CUni))
        return true; return false;
}
function IsBanglaBanjonborno(CUni) {
    if (CUni == 'ক' || CUni == 'খ' || CUni == 'গ' || CUni == 'ঘ' || CUni == 'ঙ' || CUni == 'চ' || CUni == 'ছ' || CUni == 'জ' || CUni == 'ঝ' || CUni == 'ঞ' || CUni == 'ট' || CUni == 'ঠ' || CUni == 'ড' || CUni == 'ঢ' || CUni == 'ণ' || CUni == 'ত' || CUni == 'থ' || CUni == 'দ' || CUni == 'ধ' || CUni == 'ন' || CUni == 'প' || CUni == 'ফ' || CUni == 'ব' || CUni == 'ভ' || CUni == 'ম' || CUni == 'শ' || CUni == 'ষ' || CUni == 'স' || CUni == 'হ' || CUni == 'য' || CUni == 'র' || CUni == 'ল' || CUni == 'য়' || CUni == 'ং' || CUni == 'ঃ' || CUni == 'ঁ' || CUni == 'ৎ')
        return true; return false;
}
function IsBanglaSoroborno(CUni) {
    if (CUni == 'অ' || CUni == 'আ' || CUni == 'ই' || CUni == 'ঈ' || CUni == 'উ' || CUni == 'ঊ' || CUni == 'ঋ' || CUni == 'ঌ' || CUni == 'এ' || CUni == 'ঐ' || CUni == 'ও' || CUni == 'ঔ')
        return true; return false;
}
function IsBanglaNukta(CUni) {
    if (CUni == 'ং' || CUni == 'ঃ' || CUni == 'ঁ')
        return true; return false;
}
function IsBanglaFola(CUni) {
    if (CUni == "্য" || CUni == "্র")
        return true; return false;
}
function IsBanglaHalant(CUni) {
    if (CUni == '্')
        return true; return false;
}
function IsSpace(C) {
    if (C == ' ' || C == '\t' || C == '\n' || C == '\r')
        return true; return false;
}
function MapKarToSorborno(CUni) {
    let CSorborno = CUni; if (CUni == 'া')
        CSorborno = 'আ'; else if (CUni == 'ি')
            CSorborno = 'ই'; else if (CUni == 'ী')
                CSorborno = 'ঈ'; else if (CUni == 'ু')
                    CSorborno = 'উ'; else if (CUni == 'ূ')
                        CSorborno = 'ঊ'; else if (CUni == 'ৃ')
                            CSorborno = 'ঋ'; else if (CUni == 'ে')
                                CSorborno = 'এ'; else if (CUni == 'ৈ')
                                    CSorborno = 'ঐ'; else if (CUni == 'ো')
                                        CSorborno = 'ও'; else if (CUni == "ো")
                                            CSorborno = 'ও'; else if (CUni == 'ৌ')
                                                CSorborno = 'ঔ'; else if (CUni == "ৌ")
                                                    CSorborno = 'ঔ'; return CSorborno;
}
function MapSorbornoToKar(CUni) {
    let CKar = CUni; if (CUni == 'আ')
        CKar = 'া'; else if (CUni == 'ই')
            CKar = 'ি'; else if (CUni == 'ঈ')
                CKar = 'ী'; else if (CUni == 'উ')
                    CKar = 'ু'; else if (CUni == 'ঊ')
                        CKar = 'ূ'; else if (CUni == 'ঋ')
                            CKar = 'ৃ'; else if (CUni == 'এ')
                                CKar = 'ে'; else if (CUni == 'ঐ')
                                    CKar = 'ৈ'; else if (CUni == 'ও')
                                        CKar = 'ো'; else if (CUni == 'ঔ')
                                            CKar = 'ৌ'; return CKar;
}

// -------------------------------------------------------------------------------------

const bijoy_string_conversion_map = {
    "i¨": "র‌্য",
    "ª¨": "্র্য",
    "°": "ক্ক",
    "±": "ক্ট",
    "³": "ক্ত",
    "K¡": "ক্ব",
    "¯Œ": "স্ক্র",
    "µ": "ক্র",
    "K¬": "ক্ল",
    "¶": "ক্ষ",
    "ÿ": "ক্ষ",
    "·": "ক্স",
    "¸": "গু",
    "»": "গ্ধ",
    "Mœ": "গ্ন",
    "M¥": "গ্ম",
    "M­": "গ্ল",
    "¼": "ঙ্ক",
    "•¶": "ঙ্ক্ষ",
    "•L": "ঙ্খ",
    "½": "ঙ্গ",
    "•N": "ঙ্ঘ",
    "•": "ক্স",
    "”P": "চ্চ",
    "”Q": "চ্ছ",
    "”Q¡": "চ্ছ্ব",
    "”T": "চ্ঞ",
    "¾¡": "জ্জ্ব",
    "¾": "জ্জ",
    "À": "জ্ঝ",
    "Á": "জ্ঞ",
    "R¡": "জ্ব",
    "Â": "ঞ্চ",
    "Ã": "ঞ্ছ",
    "Ä": "ঞ্জ",
    "Å": "ঞ্ঝ",
    "Æ": "ট্ট",
    "U¡": "ট্ব",
    "U¥": "ট্ম",
    "Ç": "ড্ড",
    "È": "ণ্ট",
    "É": "ণ্ঠ",
    "Ý": "ন্স",
    "Ê": "ণ্ড",
    "š‘": "ন্তু",
    "Y\\^": "ণ্ব",
    "Ë": "ত্ত",
    "Ë¡": "ত্ত্ব",
    "Ì": "ত্থ",
    "Z¥": "ত্ম",
    "š—¡": "ন্ত্ব",
    "Z¡": "ত্ব",
    "Î": "ত্র",
    "_¡": "থ্ব",
    "˜M": "দ্গ",
    "˜N": "দ্ঘ",
    "Ï": "দ্দ",
    "×": "দ্ধ",
    "˜¡": "দ্ব",
    "Ø": "দ্ব",
    "™¢": "দ্ভ",
    "Ù": "দ্ম",
    "`ª“": "দ্রু",
    "aŸ": "ধ্ব",
    "a¥": "ধ্ম",
    "›U": "ন্ট",
    "Ú": "ন্ঠ",
    "Û": "ন্ড",
    "šÍ": "ন্ত",
    "š—": "ন্ত",
    "š¿": "ন্ত্র",
    "š’": "ন্থ",
    "›`": "ন্দ",
    "›Ø": "ন্দ্ব",
    "Ü": "ন্ধ",
    "bœ": "ন্ন",
    "š\\^": "ন্ব",
    "b¥": "ন্ম",
    "Þ": "প্ট",
    "ß": "প্ত",
    "cœ": "প্ন",
    "à": "প্প",
    "cø": "প্ল",
    "c­": "প্ল",
    "á": "প্স",
    "d¬": "ফ্ল",
    "â": "ব্জ",
    "ã": "ব্দ",
    "ä": "ব্ধ",
    "eŸ": "ব্ব",
    "e­": "ব্ল",
    "å": "ভ্র",
    "gœ": "ম্ন",
    "¤ú": "ম্প",
    "ç": "ম্ফ",
    "¤\\^": "ম্ব",
    "¤¢": "ম্ভ",
    "¤£": "ম্ভ্র",
    "¤§": "ম্ম",
    "¤­": "ম্ল",
    "i“": "রু",
    "iæ": "রু",
    "iƒ": "রূ",
    "é": "ল্ক",
    "ê": "ল্গ",
    "ë": "ল্ট",
    "ì": "ল্ড",
    "í": "ল্প",
    "î": "ল্ফ",
    "j¦": "ল্ব",
    "j¥": "ল্ম",
    "jø": "ল্ল",
    "ï": "শু",
    "ð": "শ্চ",
    "kœ": "শ্ন",
    "kø": "শ্ল",
    "k¦": "শ্ব",
    "k¥": "শ্ম",
    "k­": "শ্ল",
    "®‹": "ষ্ক",
    "®Œ": "ষ্ক্র",
    "ó": "ষ্ট",
    "ô": "ষ্ঠ",
    "ò": "ষ্ণ",
    "®ú": "ষ্প",
    "õ": "ষ্ফ",
    "®§": "ষ্ম",
    "¯‹": "স্ক",
    "÷": "স্ট",
    "ö": "স্খ",
    "¯—": "স্ত",
    "¯Í": "স্ত",
    "¯‘": "স্তু",
    "¯¿": "স্ত্র",
    "¯’": "স্থ",
    "mœ": "স্ন",
    "¯ú": "স্প",
    "ù": "স্ফ",
    "¯\\^": "স্ব",
    "¯§": "স্ম",
    "¯­": "স্ল",
    "û": "হু",
    "nè": "হ্ণ",
    "ý": "হ্ন",
    "þ": "হ্ম",
    "n¬": "হ্ল",
    "ü": "হৃ",
    "©": "র্",
    "Av": "আ",
    "A": "অ",
    "B": "ই",
    "C": "ঈ",
    "D": "উ",
    "E": "ঊ",
    "F": "ঋ",
    "G": "এ",
    "H": "ঐ",
    "I": "ও",
    "J": "ঔ",
    "K": "ক",
    "L": "খ",
    "M": "গ",
    "N": "ঘ",
    "O": "ঙ",
    "P": "চ",
    "Q": "ছ",
    "R": "জ",
    "S": "ঝ",
    "T": "ঞ",
    "U": "ট",
    "V": "ঠ",
    "W": "ড",
    "X": "ঢ",
    "Y": "ণ",
    "Z": "ত",
    "_": "থ",
    "`": "দ",
    "a": "ধ",
    "b": "ন",
    "c": "প",
    "d": "ফ",
    "e": "ব",
    "f": "ভ",
    "g": "ম",
    "h": "য",
    "i": "র",
    "j": "ল",
    "k": "শ",
    "l": "ষ",
    "m": "স",
    "n": "হ",
    "o": "ড়",
    "p": "ঢ়",
    "q": "য়",
    "r": "ৎ",
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
    "v": "া",
    "w": "ি",
    "x": "ী",
    "y": "ু",
    "z": "ু",
    "~": "ূ",
    "„": "ৃ",
    "‡": "ে",
    "†": "ে",
    "‰": "ৈ",
    "\\ˆ": "ৈ",
    "Š": "ৗ",
    "Ô": "‘",
    "Õ": "’",
    "\\|": "।",
    "Ò": "“",
    "Ó": "”",
    "s": "ং",
    "t": "ঃ",
    "u": "ঁ",
    "ª": "্র",
    "Ö": "্র",
    "«": "্র",
    "¨": "্য",
    "\\&": "্",
    "…": "ৃ"
};
const somewherein_string_conversion_map = {
    "ª¨": "্র্য",
    "i¨": "র‌্য",
    "°": "ক্ক",
    "±": "ক্ট",
    "³": "ক্ত",
    "K¡": "ক্ব",
    "¯Œ": "স্ক্র",
    "µ": "ক্র",
    "K¬": "ক্ল",
    "¶": "ক্ষ",
    "·": "ক্স",
    "¸": "গু",
    "»": "গ্ধ",
    "Mœ": "গ্ন",
    "M¥": "গ্ম",
    "M­": "গ্ল",
    "¼": "ঙ্ক",
    "•¶": "ঙ্ক্ষ",
    "•L": "ঙ্খ",
    "½": "ঙ্গ",
    "•N": "ঙ্ঘ",
    "•": "ক্স",
    "”P": "চ্চ",
    "”Q": "চ্ছ",
    "”Q¡": "চ্ছ্ব",
    "”T": "চ্ঞ",
    "¾¡": "জ্জ্ব",
    "¾": "জ্জ",
    "À": "জ্ঝ",
    "Á": "জ্ঞ",
    "R¡": "জ্ব",
    "Â": "ঞ্চ",
    "Ã": "ঞ্ছ",
    "Ä": "ঞ্জ",
    "Å": "ঞ্ঝ",
    "Æ": "ট্ট",
    "U¡": "ট্ব",
    "U¥": "ট্ম",
    "Ç": "ড্ড",
    "È": "ণ্ট",
    "É": "ণ্ঠ",
    "Ý": "ন্স",
    "Ê": "ণ্ড",
    "š‘": "ন্তু",
    "Y\\^": "ণ্ব",
    "Ë": "ত্ত",
    "Ë¡": "ত্ত্ব",
    "Ì": "ত্থ",
    "Z¥": "ত্ম",
    "š—¡": "ন্ত্ব",
    "Z¡": "ত্ব",
    "Î": "ত্র",
    "_¡": "থ্ব",
    "˜M": "দ্গ",
    "˜N": "দ্ঘ",
    "Ï": "দ্দ",
    "×": "দ্ধ",
    "˜¡": "দ্ব",
    "Ø": "দ্ব",
    "™¢": "দ্ভ",
    "Ù": "দ্ম",
    "`ª“": "দ্রু",
    "aŸ": "ধ্ব",
    "a¥": "ধ্ম",
    "›U": "ন্ট",
    "Û": "ন্ড",
    "šÍ": "ন্ত",
    "š—": "ন্ত",
    "š¿": "ন্ত্র",
    "š’": "ন্থ",
    "›`": "ন্দ",
    "›Ø": "ন্দ্ব",
    "Ü": "ন্ধ",
    "bœ": "ন্ন",
    "š\\^": "ন্ব",
    "b¥": "ন্ম",
    "Þ": "প্ট",
    "ß": "প্ত",
    "cœ": "প্ন",
    "à": "প্প",
    "cø": "প্ল",
    "c­": "প্ল",
    "á": "প্স",
    "d¬": "ফ্ল",
    "â": "ব্জ",
    "ã": "ব্দ",
    "ä": "ব্ধ",
    "eŸ": "ব্ব",
    "e­": "ব্ল",
    "å": "ভ্র",
    "gœ": "ম্ন",
    "¤ú": "ম্প",
    "ç": "ম্ফ",
    "¤\\^": "ম্ব",
    "¤¢": "ম্ভ",
    "¤£": "ম্ভ্র",
    "¤§": "ম্ম",
    "¤­": "ম্ল",
    "i“": "রু",
    "iæ": "রু",
    "iƒ": "রূ",
    "é": "ল্ক",
    "ê": "ল্গ",
    "ë": "ল্ট",
    "ì": "ল্ড",
    "í": "ল্প",
    "î": "ল্ফ",
    "j¦": "ল্ব",
    "j¥": "ল্ম",
    "j­": "ল্ল",
    "ï": "শু",
    "ð": "শ্চ",
    "kœ": "শ্ন",
    "k¦": "শ্ব",
    "k¥": "শ্ম",
    "k­": "শ্ল",
    "®‹": "ষ্ক",
    "®Œ": "ষ্ক্র",
    "ó": "ষ্ট",
    "ô": "ষ্ঠ",
    "ò": "ষ্ণ",
    "®ú": "ষ্প",
    "õ": "ষ্ফ",
    "®§": "ষ্ম",
    "¯‹": "স্ক",
    "÷": "স্ট",
    "ö": "স্খ",
    "¯—": "স্ত",
    "¯‘": "স্তু",
    "¯¿": "স্ত্র",
    "¯’": "স্থ",
    "mœ": "স্ন",
    "¯ú": "স্প",
    "ù": "স্ফ",
    "¯\\^": "স্ব",
    "¯§": "স্ম",
    "¯­": "স্ল",
    "nè": "হ্ণ",
    "ý": "হ্ন",
    "þ": "হ্ম",
    "û": "হু",
    "n¬": "হ্ল",
    "ü": "হৃ",
    "©": "র্",
    "Av": "আ",
    "A": "অ",
    "B": "ই",
    "C": "ঈ",
    "D": "উ",
    "E": "ঊ",
    "F": "ঋ",
    "G": "এ",
    "H": "ঐ",
    "I": "ও",
    "J": "ঔ",
    "K": "ক",
    "L": "খ",
    "M": "গ",
    "N": "ঘ",
    "O": "ঙ",
    "P": "চ",
    "Q": "ছ",
    "R": "জ",
    "S": "ঝ",
    "T": "ঞ",
    "U": "ট",
    "V": "ঠ",
    "W": "ড",
    "X": "ঢ",
    "Y": "ণ",
    "Z": "ত",
    "_": "থ",
    "`": "দ",
    "a": "ধ",
    "b": "ন",
    "c": "প",
    "d": "ফ",
    "e": "ব",
    "f": "ভ",
    "g": "ম",
    "h": "য",
    "i": "র",
    "j": "ল",
    "k": "শ",
    "l": "ষ",
    "m": "স",
    "n": "হ",
    "o": "ড়",
    "p": "ঢ়",
    "q": "য়",
    "r": "ৎ",
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
    "v": "া",
    "w": "ি",
    "x": "ী",
    "y": "ু",
    "z": "ু",
    "~": "ূ",
    "„": "ৃ",
    "‡": "ে",
    "†": "ে",
    "‰": "ৈ",
    "\\ˆ": "ৈ",
    "Š": "ৗ",
    "s": "ং",
    "t": "ঃ",
    "u": "ঁ",
    "ª": "্র",
    "Ö": "্র",
    "«": "্র",
    "¨": "্য",
    "…": "ৃ",
    "Ô": "‘",
    "Õ": "’",
    "\\|": "।",
    "\\&": "্",
    "Ò": "“",
    "Ó": "”"
};
const boisakhi_string_conversion_map = {
    "Ûø": "্র্য",
    "kø": "র‌্য",
    "~": "ক্ক",
    "ƒ": "ক্ট",
    "£ß": "ক্ত",
    "Kò": "ক্ব",
    "Ç": "স্ক্র",
    "¢ß": "ক্র",
    "qô": "ক্ষ্ম",
    "q": "ক্ষ",
    "…": "ক্স",
    "•": "ক্স",
    "Kõ": "ক্ল",
    "†": "গু",
    "‡": "গ্গ",
    "ˆ": "গ্ধ",
    "Mí": "গ্ন",
    "Mô": "গ্ম",
    "Mö": "গ্ল",
    "‰": "ঙ্ক",
    "áq": "ঙ্ক্ষ",
    "áL": "ঙ্খ",
    "Š": "ঙ্গ",
    "áN": "ঙ্ঘ",
    "âP": "চ্চ",
    "âQ": "চ্ছ",
    "âQò": "চ্ছ্ব",
    "Œò": "জ্জ্ব",
    "Œ": "জ্জ",
    "š": "জ্ঞ",
    "Rò": "জ্ব",
    "é": "ঞ্চ",
    "˜": "ঞ্ছ",
    "™": "ঞ্জ",
    "ã": "ঞ্ঝ",
    "›": "ট্ট",
    "Uò": "ট্ব",
    "Uô": "ট্ম",
    "œ": "ড্ড",
    "Ÿ": "ণ্ঠ",
    "Ý": "ন্স",
    "¡": "ণ্ড",
    "š‘": "ন্তু",
    "ìç": "ন্তু",
    "ìÿ": "ন্থ",
    "Yð": "ণ্ব",
    "ª": "ন্ঠ",
    "£ò": "ত্ত্ব",
    "¤": "ত্থ",
    "Zí": "ত্ন",
    "£ô": "ত্ম",
    "Zô": "ত্ম",
    "£": "ত্ত",
    "Zò": "ত্ব",
    "¢": "ত্র",
    "aò": "থ্ব",
    "¥": "দ্দ",
    "¦": "দ্ধ",
    "§": "দ্ব",
    "¨": "দ্ভ",
    "bô": "দ্ম",
    "cµ": "ধ্ব",
    "ëU": "ন্ট",
    "åU": "ন্ট",
    "«": "ন্ড",
    "ìæ": "ন্ত",
    "ìòæ": "ন্ত্ব",
    "ìè": "ন্ত্র",
    "ëb": "ন্দ",
    "ë§": "ন্দ্ব",
    "¬": "ন্ধ",
    "ëc": "ন্ধ",
    "Ò": "ন্ন",
    "dí": "ন্ন",
    "ìñ": "ন্ব",
    "dô": "ন্ম",
    "ëo": "ন্স",
    "ïU": "প্ট",
    "®": "প্ত",
    "eí": "প্ন",
    "¯": "প্প",
    "eö": "প্ল",
    "d¬": "ফ্ল",
    "fõ": "ফ্ল",
    "±": "ব্জ",
    "²": "ব্দ",
    "³": "ব্ধ",
    "gµ": "ব্ব",
    "gö": "ব্ল",
    "gõ": "ব্ল",
    "»": "ম্ভ্র",
    "ó¸": "ম্ভ্র",
    "¸": "ভ্র",
    "ií": "ম্ন",
    "óe": "ম্প",
    "óf": "ম্ফ",
    "¹": "ম্ব",
    "º": "ম্ভ",
    "ói": "ম্ম",
    "óö": "ম্ল",
    "¿": "ল্ক",
    "ùM": "ল্গ",
    "ùU": "ল্ট",
    "À": "ল্ড",
    "ùe": "ল্প",
    "ùf": "ল্ফ",
    "lð": "ল্ব",
    "lô": "ল্ম",
    "Á": "ল্ল",
    "lö": "ল্ল",
    "lõ": "ল্ল",
    "Â": "শু",
    "úP": "শ্চ",
    "mí": "শ্ন",
    "mð": "শ্ব",
    "mô": "শ্ম",
    "mö": "শ্ল",
    "ûK": "ষ্ক",
    "û¢ß": "ষ্ক্র",
    "Ä": "ষ্ট",
    "Å": "ষ্ঠ",
    "ûe": "ষ্প",
    "üf": "ষ্ফ",
    "ûô": "ষ্ম",
    "Æ": "স্ক",
    "ýL": "স্খ",
    "ýU": "স্ট",
    "þU": "স্ট",
    "þÿ": "স্খ",
    "þæ": "স্ত",
    "þç": "স্তু",
    "þè": "স্ত্র",
    "þí": "স্ন",
    "oí": "স্ন",
    "þe": "স্প",
    "ýf": "স্ফ",
    "È": "স্ব",
    "þñ": "স্ব",
    "þô": "স্ম",
    "É": "হু",
    "pî": "হ্ণ",
    "pß": "হ্ন",
    "Ê": "হ্ম",
    "n¬": "হ্ল",
    "põ": "হ্ল",
    "pÕ": "হৃ",
    "ò": "ব",
    "Aw": "আ",
    "A": "অ",
    "B": "ই",
    "C": "ঈ",
    "D": "উ",
    "E": "ঊ",
    "F": "ঋ",
    "G": "এ",
    "H": "ঐ",
    "I": "ও",
    "J": "ঔ",
    "K": "ক",
    "L": "খ",
    "M": "গ",
    "N": "ঘ",
    "O": "ঙ",
    "P": "চ",
    "Q": "ছ",
    "R": "জ",
    "S": "ঝ",
    "T": "ঞ",
    "U": "ট",
    "V": "ঠ",
    "W": "ড",
    "X": "ঢ",
    "Y": "ণ",
    "Z": "ত",
    "¤": "থ",
    "b": "দ",
    "c": "ধ",
    "d": "ন",
    "e": "প",
    "f": "ফ",
    "g": "ব",
    "h": "ভ",
    "i": "ম",
    "j": "য",
    "k": "র",
    "l": "ল",
    "m": "শ",
    "n": "ষ",
    "o": "স",
    "p": "হ",
    "r": "ড়",
    "s": "ঢ়",
    "t": "য়",
    "a": "থ",
    "u": "ৎ",
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
    "w": "া",
    "x": "ি",
    "y": "ী",
    "×": "ু",
    "Ö": "ু",
    "Ø": "ু",
    "Ô": "ূ",
    "Õ": "ূ",
    "Ó": "ূ",
    "Ù": "ৃ",
    "Ú": "ৃ",
    "Ë": "ে",
    "Ì": "ে",
    "Ð": "ৈ",
    "Ñ": "ৈ",
    "\\ˆ": "ৈ",
    "#": "ৗ",
    "„": "।",
    "z": "্",
    "v": "ং",
    "\\^": "ঁ",
    "Þ": "্র",
    "Û": "্র",
    "ê": "র্",
    "ø": "্য"
};
function ReArrangeUnicodeConvertedText(str) {
    for (let i = 0; i < str.length; i++) {
        if (i > 0 && str.charAt(i) == '\u09CD' && (IsBanglaKar(str.charAt(i - 1)) || IsBanglaNukta(str.charAt(i - 1))) && i < str.length - 1) {
            let temp = str.substring(0, i - 1);
            temp += str.charAt(i);
            temp += str.charAt(i + 1);
            temp += str.charAt(i - 1);
            temp += str.substring(i + 2, str.length);
            str = temp;
        }
        if (i > 0 && i < str.length - 1 && str.charAt(i) == '\u09CD' && str.charAt(i - 1) == '\u09B0' && str.charAt(i - 2) != '\u09CD' && IsBanglaKar(str.charAt(i + 1))) {
            let temp = str.substring(0, i - 1);
            temp += str.charAt(i + 1);
            temp += str.charAt(i - 1);
            temp += str.charAt(i);
            temp += str.substring(i + 2, str.length);
            str = temp;
        }
        if (i < str.length - 1 && str.charAt(i) == 'র' && IsBanglaHalant(str.charAt(i + 1)) && !IsBanglaHalant(str.charAt(i - 1))) {
            let j = 1;
            while (true) {
                if (i - j < 0)
                    break;
                if (IsBanglaBanjonborno(str.charAt(i - j)) && IsBanglaHalant(str.charAt(i - j - 1)))
                    j += 2;
                else if (j == 1 && IsBanglaKar(str.charAt(i - j)))
                    j++;
                else
                    break;
            }
            let temp = str.substring(0, i - j);
            temp += str.charAt(i);
            temp += str.charAt(i + 1);
            temp += str.substring(i - j, i);
            temp += str.substring(i + 2, str.length);
            str = temp;
            i += 1;
            continue;
        }
        if (i < str.length - 1 && IsBanglaPreKar(str.charAt(i)) && IsSpace(str.charAt(i + 1)) == false) {
            let temp = str.substring(0, i);
            let j = 1;
            while (IsBanglaBanjonborno(str.charAt(i + j))) {
                if (IsBanglaHalant(str.charAt(i + j + 1)))
                    j += 2;
                else
                    break;
            }
            temp += str.substring(i + 1, i + j + 1);
            let l = 0;
            if (str.charAt(i) == 'ে' && str.charAt(i + j + 1) == 'া') {
                temp += "ো";
                l = 1;
            } else if (str.charAt(i) == 'ে' && str.charAt(i + j + 1) == "ৗ") {
                temp += "ৌ";
                l = 1;
            } else
                temp += str.charAt(i);
            temp += str.substring(i + j + l + 1, str.length);
            str = temp;
            i += j;
        }
        if (i < str.length - 1 && str.charAt(i) == 'ঁ' && IsBanglaPostKar(str.charAt(i + 1))) {
            let temp = str.substring(0, i);
            temp += str.charAt(i + 1);
            temp += str.charAt(i);
            temp += str.substring(i + 2, str.length);
            str = temp;
        }
    }
    return str;
}
function ConvertToUnicode(ConvertFrom = 'bijoy') {
    let line = getSelectedText();
    let conversion_map = bijoy_string_conversion_map;
    if (ConvertFrom == "bijoy")
        conversion_map = bijoy_string_conversion_map;
    else if (ConvertFrom == "somewherein")
        conversion_map = somewherein_string_conversion_map;
    else if (ConvertFrom == "boisakhi")
        conversion_map = boisakhi_string_conversion_map;
    for (const ascii in conversion_map) {
        const myRegExp = new RegExp(ascii,"g");
        line = line.replace(myRegExp, conversion_map[ascii]);
    }
    line = ReArrangeUnicodeConvertedText(line);
    const myRegExp = new RegExp("অা","g");
    line = line.replace(myRegExp, "আ");
    
    insertText(line);
    // return line;
}

// -------------------------------------------------------------------------------------


function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Convert to Unicode', 'ConvertToUnicode')
      .addToUi();
}

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  DocumentApp.getUi()
      .createMenu('Bijoy Converter')
      .addItem('Convert', 'ConvertToUnicode')
      .addToUi();

}
