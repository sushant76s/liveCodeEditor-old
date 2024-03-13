import React, {useEffect, useRef} from 'react';
// import PropTypes from 'prop-types';
import Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({socketRef, roomId, onCodeChange, theme}) => {
  const editorRef = useRef(null);
  // console.log(theme);
  useEffect(() => {
    async function init() {

      if (editorRef.current) {
        editorRef.current.toTextArea();
      }

      editorRef.current = Codemirror.fromTextArea(document.getElementById('liveEditor'), {
        mode: {name: 'javascript', json: true},
        theme: theme,
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      }
      );

      editorRef.current.on('change', (instance, changes)=> {
        // console.log('changes', changes);
        const {origin} = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if(origin !== 'setValue') {

          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
        // console.log(code);
      });


      //set dynamically default text or code
      // editorRef.current.setValue(`console.log('Hello, World!');`);

    }
    init();

    // Cleanup function to destroy the editor when the component is unmounted
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
      }
    };
  }, [theme]);


  useEffect(() => {
    if(socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({code}) =>{
        if(code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () =>{
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    }

  }, [socketRef.current]);


  return (
    <textarea id='liveEditor'></textarea>
  )
}

// Editor.propTypes = {
//   theme: PropTypes.string,
// };

export default Editor