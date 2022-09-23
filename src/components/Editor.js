import React, {useEffect, useRef} from 'react';
import Codemirror from 'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({socketRef, roomId, onCodeChange}) => {
  const editorRef = useRef(null);
  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(document.getElementById('liveEditor'), {
        mode: {name: 'javascript', json: true},
        theme: 'dracula',
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
  }, []);


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

export default Editor