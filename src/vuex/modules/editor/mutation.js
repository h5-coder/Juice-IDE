/**
 * Created by 15236 on 2017/10/25.
 */
export const editorMutation = {
    ['UPDATE_ACTION_CODE'] (state,code) {
        state.actionCode = code;
    },
    ['UPDATE_SAVE_CODE'] (state,code) {
        state.saveCode = code;
    },
    ['UPLOAD_EDIT_FILEDATA'](state,data){
        state.editData = data
    },

};