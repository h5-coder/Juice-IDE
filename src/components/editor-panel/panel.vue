<template class="wrap">

    <div id="javascript-editor"></div>
   <!--  <div id="tips"  v-show='tipsVisible'></div> -->


</template>

<script>
    //import  from ''
    //brace
    import * as ace from 'brace';
    import 'brace/mode/javascript';
    import 'brace/theme/tomorrow';
    import 'brace/ext/language_tools'
    import 'brace/ext/searchbox'
    import '@/services/Mode-solidity'
    import 'brace/keybinding/vim'
    import {mapState, mapActions, mapGetters} from 'vuex';
    import file from '@/services/API-file'
    import compileService from '@/services/compile-exe/compile-service';
    var beautify = require('js-beautify').js_beautify
    var fs = require('fs')
    ace.acequire('ace/ext/language_tools')
    ace.acequire('ace/ext/searchbox')
    export default {
        //组件名
        name: '',
        //实例的数据对象
        data() {
            return {
                editor:{},
                sessions:{},
                currentSession:""
            }
        },
        //数组或对象，用于接收来自父组件的数据
        props: ["currentView","value","searchValue",'name','keyId'],
        //计算
        computed: {
            ...mapGetters(['actionCode','editData','editFile','fileTreeData','activeFile','getUrl','currentName','consoleFlag','consoleHeight','fileData','activeEditor','copyText'])
        },
        //方法
        methods: {
            ...mapActions(['saveCode','updateData','updateTreeData','updateActiveEditor','saveEditorFile','saveEditor','updateRightMenuBlock','saveOtherPath','saveAllFile','queryFileListData'
                ,'updateEditFile','updateUrl','updateCurrentId','boolSuccessVisible','changeShowTipModal','changeShowDeleteModal','changeDeleteFile',
	            'changeShowFileNameModal','changeDirNameModal','setHintInfo','updateNewOpenFile','queryFileData','updateCopyText']),
            //放大缩小字体
            editorFontSize:function(incr){
                this.editor.setFontSize(this.editor.getFontSize() + incr)
            },
            //代码格式化
            format:function(){
                this.editor.setValue(beautify(this.editor.getValue()),1);
                //引用了js-beautify库
            },

            //设置当前高亮显示即正在编辑状态的文件信息
            setActiveEditor(cb){
	            const editorData = {
		            value: this.editFile.value,
		            name: this.editFile.name,
		            keyId:this.editFile.keyId,
		            source: this.getValue()
	            }
                console.log( "设置当前高亮即正在编辑状态的文件信息》》》》》》》》》》》》》》》")
	            this.updateActiveEditor(editorData);
                if(cb && typeof(cb)=='function'){
                    cb();
                }
            },
            // setActiveEditor(id,cb){
            //     const editorData = {
            //         value: this.editFile.value,
            //         name: this.editFile.name,
            //         keyId:this.editFile.keyId,
            //         source: this.get(id)
            //     }
            //     console.log( "设置当前高亮即正在编辑状态的文件信息》》》》》》》》》》》》》》》")
            //     this.updateActiveEditor(editorData);
            //     if(cb && typeof(cb)=='function'){
            //         cb();
            //     }
            // },
            //编辑区的change事件
            change:function(){
                //监听编辑区的change事件
                let red = null;
	            this.editor.on("focus",()=>{
	            	if(!red){
			            red = this.editor.getSession().on('change', (e)=> {
				            this.updateTreeData({keyId:this.activeEditor.keyId,save:false});
				            this.initChange();
			            })
                    }

	            });

	            this.editor.on("blur",()=>{
		            this.editor.getSession().off('change',red);
		            red = null;
	            });
            },

            //设置错误警示css
            setBreakpoint:function(row,css){
                this.editor.session.setBreakpoint(row,css);
            },
            //语法检查
            getResult:function(){
                //语法检查
                // var _this = this;
                this.editor.session.clearBreakpoints();
                compileService.grammarCheck((result, missingInputs, source)=>{
                    console.log('语法检查',result)
                    console.log('文件信息',source)
                    if(result.errors && result.errors.length>0){
                        /*
                            语法检查：依次遍历错误数组，获取错误行数，然后依次显示在编辑区的相应位置，每次切换tab时去掉class
                        */
                        let css='';
                        result.errors.forEach((error)=>{
                            var errorId = error.match(/\.sol\:[0-9]+/i);
                            var rowId = errorId[0].match(/\.sol\:(\S*)/i);
                            var tips = errorId.input.replace(/\s/g,"").match(/\.sol\:[0-9]+\:[0-9]+\:(\S*)\:/i)
                            console.log(rowId[1],tips[1]);
                            if(tips[1] == 'Warning'){
                                css = 'ace_warning';


                            }else{
                                css = 'ace_error';
                                // this.setBreakpoint(rowId[1]-1,css);
                            }
                            this.setBreakpoint(rowId[1]-1,css);
                            this.mouseHover(error,rowId[1]-1);
                        });
                    }else{
                        console.log('没有错误警示')
                        this.editor.session.clearBreakpoints();
                    }
                },this.value);
            },
            initChange:function(){
                const data = this.editData;
                const item = {
                    value:this.value,
                    name:this.name,
                    keyId:this.keyId,
                    source:this.editor.getValue()
                }
	            this.setActiveEditor(this.getResult);
                console.log("当前item为");
                for (let i = data.length - 1; i >= 0; i--) {
                    if(item.keyId === data[i].keyId){
                        data[i].source = item.source
                        this.updateData(data);
                        return false;
                    }
                }
                data.push(item);
                this.updateData(data);
            },
            get:function (id) {
                if (this.currentSession === id) {
                  return this.editor.getValue()
                }
            },
            //获取当前值
            getValue:function(){
                return this.editor.getValue();
            },
            //鼠标hover事件
            mouseHover:function(str,r){
                //hover报错行显示报错的是啥信息
                this.editor.on('guttermousemove',(e)=>{
                    var target = e.domEvent.target;
                    var className = e.domEvent.toElement.className;
                    if(className.indexOf('ace_error') >= 0 || className.indexOf('ace_warning') >= 0){
                        //hover的每一行显示存在这些，则需要给每行的title赋值
                        //获取行数
                        var row = e.getDocumentPosition().row;
                        console.log(className,row);
                        if(row == r){
                            //即出错行和当前鼠标hover上去的行数相等，赋值
                            e.domEvent.toElement.title = str;
                            return false;
                        }else{
                            //不赋值
                        }
                    }else{
                        //hover的每一行不显示存在这些，则不需要给每行的title赋值
                        // console.log(className)
                        e.domEvent.toElement.title=""
                    }

                });
            },
            //绑定的一系列事件
            topFn(){
                this.updateRightMenuBlock(false);
            },
	        newFile(){
		        let blo = true;
		        this.fileTreeData.forEach((item,index)=>{
			        if(item.keyId === this.activeFile.keyId && file.isFile(this.activeFile.value)){
				        blo = false;
			        }
		        });

		        if(this.activeFile.value && blo){
			        this.changeShowFileNameModal(true);
		        }else{
			        file.newFile('',name,(res)=>{
				        if(this.activeFile.id === 1){
					        this.updateNewOpenFile(this.activeFile);
				        }
				        if(res.code === 2){
					        const url = this.getUrl;
					        url.push({value:'',name:file.uffixName(this.currentName),keyId:res.keyId});
					        this.updateUrl(url);
					        this.updateEditFile({
						        name:file.uffixName(this.currentName),
						        value:res.value,
						        keyId:res.keyId
					        })
					        this.updateCurrentId() // 更新id
				        }
			        })
		        }
		        this.updateRightMenuBlock(false);
	        },
	        newDir(){
		        this.changeDirNameModal(true);
	        },
	        exportFile(type){
		        file.exportFile(type,this.fileTreeData,(filename)=>{
			        if(filename && file.isObject(filename)){
				        this.setHintInfo({
					        show:true,
					        title:'',
					        message:type == 'file' ? '文件已存在在项目中' : '文件夹已存在项目中'
				        })
			        }else if(filename){
				        const url = this.getUrl;
				        url.push({value:filename,name:file.basename(filename)});
				        this.updateUrl(url);
			        }
		        });
	        },
            //保存成功提示
            success:function(cb){
                this.boolSuccessVisible(true);
                setTimeout(()=>{
                    this.boolSuccessVisible(false);
                },500);
                if(cb && typeof(cb)=='function'){
                    cb();
                }
            },

	        intiFileData(){
		        this.queryFileData();
		        const data = this.fileData;
		        if( data.length > 0){
			        this.updateEditFile(data[0]);
		        }
	        },
            createSession(content){
                var s = new ace.EditSession(content,'ace/mode/javascript');
                s.setUndoManager(new ace.UndoManager());
                s.setTabSize(4);
                s.setUseSoftTabs(true);
                return s;
            },
            switchSession(id){
                this.currentSession=id;
                this.editor.setSession(this.sessions[this.currentSession]);
                this.editor.focus();
            },
            //设置值
            setValue:function(){
                // this.editor.session.clearBreakpoints();
                console.log('setvalue》》》》》》》》》》》》》》》》》》')
                let arr = this.editData.filter((item)=>{
                    return item.keyId === this.keyId
                });
                if(arr.length != 0){
                    console.log('缓存中的值')
                    this.editor.setValue(beautify(arr[0].source),1);
                    this.setActiveEditor(this.getResult);
                }else{
                    if(this.value){
                        fs.readFile(this.value,"utf-8",  (err, data)=> {
                            if (err) {
                                return console.error(err);
                            }
                            console.log('读取路径文件的值')
                            this.editor.setValue(beautify(data.toString()),1);
                            this.setActiveEditor(this.getResult);
                        });
                    }else{
                        this.editor.setValue(beautify("pragma solidity ^0.4.2;"),1);
                        this.setActiveEditor(this.getResult);
                    }
                }
            },
            //每次keyId改变，都要新建一个editor会话，并设值
            open(){
                let arr = this.editData.filter((item)=>{
                    return item.keyId === this.keyId
                });
                let id=this.keyId;
                if(arr.length != 0){
                    console.log('读取缓存中的值');
                    //设值新的editor会话并设值值
                    if(!this.sessions[id]){
                        var session = this.createSession(arr[0].source);
                        sessions[id]=session;
                    }else{
                        this.sessions[id].setValue(arr[0].source,-1)
                    }
                }else{
                    if(this.value){
                        fs.readFile(this.value,'utf-8',(err,data)=>{
                            if (err) {
                                return console.error(err);
                            }
                            console.log('读取路径文件的值')
                            console.log(this.sessions[id])
                            // if(!this.sessions[id]){
                            //     var session = this.createSession(data.toString());
                            //     sessions[id]=session;
                            // }else{
                            //     this.sessions[id].setValue(data.toString(),-1);
                            // }
                        })
                    }else{
                        if(!this.sessions[id]){
                            var session=this.createSession('pragma solidity ^0.4.2;');
                            sessions[id]=session
                        }else{
                            this.sessions[id].setValue('pragma solidity ^0.4.2;',-1);
                        }
                    }
                }
                // this.setActiveEditor(id,this.getResult);
                this.switchSession(id);
            },
            //高度变化
            resize(){
                this.editor.resize(true);
            }
        },
        //生命周期函数
        created() {

        },
        beforeMount() {

        },
        mounted() {
            this.editor = ace.edit('javascript-editor');
            //把editor对象存在vuex中，方便在别的文件中使用editor的方法
            this.saveEditor(this.editor);
            console.log(this.editor)
            var _this = this;
            ace.acequire('ace/ext/language_tools')
            ace.acequire('ace/ext/searchbox')
            this.editor = ace.edit('javascript-editor');
            this.editor.$blockScrolling = Infinity;
            this.editor.getSession().setMode('ace/mode/javascript');
            this.editor.setTheme('ace/theme/tomorrow');
            // this.editor.setKeyboardHandler('ace/keyboard/vim');
            //启用提示菜单
            this.editor.setOptions({
                enableBasicAutocompletion: true,
                // enableSnippets: true,
                enableLiveAutocompletion: true
            });
            //设置打印边距可见度
            this.editor.setShowPrintMargin(false);
            this.editor.setStyle('font')
            //字体大小
            this.editor.setFontSize(14);
            //自动换行,设置为off关闭
            this.editor.setOption("wrap", "free");

	        this. intiFileData();
            this.change();
            this.editor.clearSelection();
            //设置格式化
            this.editor.commands.addCommand({
                name: 'myCommand',
                bindKey: {win: 'Ctrl-L',  mac: 'Command-L'},
                exec: function(editor) {
                    _this.format();
                    //...
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //设置ctrl+s 保存当前
            this.editor.commands.addCommand({
                name: 'save',
                bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                exec: function(editor) {
                    _this.saveEditorFile(_this.success)
	                // _this.editor.blur();
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定搜索
            this.editor.commands.addCommand({
                name: 'find',
                bindKey: {win: 'Ctrl-F',  mac: 'Command-F'},
                exec: function(editor) {
                    _this.$emit("findFunction",true);
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定替换
            this.editor.commands.addCommand({
                name: 'replace',
                bindKey: {win: 'Ctrl-H',  mac: 'Command-H'},
                exec: function(editor) {
                    _this.$emit("replaceFunction",true);
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定新建文件
            this.editor.commands.addCommand({
                name: 'newFile',
                bindKey: {win: 'Ctrl-N',  mac: 'Command-N'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
                    _this.newFile();
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定新建文件夹
            this.editor.commands.addCommand({
                name: 'newDir',
                bindKey: {win: 'Ctrl-W',  mac: 'Command-W'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
                    _this.newDir();
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定导入本地文件
            this.editor.commands.addCommand({
                name: 'exportFile',
                bindKey: {win: 'Ctrl-Shift-O',  mac: 'Command-Shift-O'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
                    _this.exportFile('file')
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定导入本地文件夹
            this.editor.commands.addCommand({
                name: 'exportDir',
                bindKey: {win: 'Ctrl-O',  mac: 'Command-O'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
                    _this.exportFile('dir')
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定另存为
            this.editor.commands.addCommand({
                name: 'saveOther',
                bindKey: {win: 'Ctrl-Shift-S',  mac: 'Command-Shift-S'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
                    console.log("Ctrl-Shift-S")
                    _this.saveOtherPath(1);
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定全部保存
            this.editor.commands.addCommand({
                name: 'saveAllFile',
                bindKey: {win: 'Ctrl-Alt-S',  mac: 'Command-Alt-S'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
	                // alert(11111111111111111)
                    _this.saveAllFile(_this.success);
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定删除
            this.editor.commands.addCommand({
                name: 'delete',
                bindKey: {win: 'Ctrl-Delete',  mac: 'Command-Delete'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
                    // _
                    if(_this.activeFile){
                        _this.changeDeleteFile(_this.activeFile)
                        _this.changeShowDeleteModal(true);
                    }
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });
            //绑定删除所有文件
            this.editor.commands.addCommand({
                name: 'removeAllFile',
                bindKey: {win: 'Ctrl-Shift-Delete',  mac: 'Command-Shift-Delete'},
                exec: function(editor) {
                    // _this.$emit("replaceFunction",true);
                    _this.changeShowTipModal(true);
                },
                readOnly: true // 如果不需要使用只读模式，这里设置false
            });

            // this.editor.on('copy',()=>{
            //     console.log('copy',this.editor.onCopy())
            //     // alert('复制成功')
            // });
            this.editor.on('paste',()=>{
                console.log('paste')
            })
            // //ctrl+c
            // this.editor.commands.addCommand({
            //     name: 'myCopy',
            //     bindKey: {win: 'Ctrl-C',  mac: 'Command-C'},
            //     exec: function(editor) {
            //         console.log('复制文本')
            //         _this.updateCopyText(editor.getCopyText())
            //     },
            //     readOnly: true // 如果不需要使用只读模式，这里设置false
            // });
            // //ctrl+V
            // this.editor.commands.addCommand({
            //     name: 'myPaste',
            //     bindKey: {win: 'Ctrl-V',  mac: 'Command-V'},
            //     exec: function(editor) {
            //         console.log('粘贴文本')
            //        editor.commands.commands.paste.exec(editor,_this.copyText)
            //     },
            //     readOnly: true // 如果不需要使用只读模式，这里设置false
            // });
            this.editor.resize(true);
            this.editor.setAutoScrollEditorIntoView(true);
            var content = document.getElementsByClassName('ace_content');
            console.log('content',content[0])
            console.log('contentHeight',content[0].offsetWidth)

        },
        //监视
        watch: {
            keyId:function(){
                console.log(1111111111111)
            	if(!this.editFile.unWatch){
		            this.setValue();
                    console.log('open',111111111111111111)
                    // this.open();
                }
            },
            'consoleFlag':function(){
                console.log('consoleFlag',this.consoleFlag)
                // this.editor.resize(true)
                this.$nextTick(()=>{
                    this.resize();
                })

            },
            'consoleHeight':function(){
                console.log('consoleHeight',this.consoleHeight)
                this.$nextTick(()=>{
                    this.resize();
                })
                // this.editor.resize(true)
            }

        },
        //组件
        components: {

        },
        //过滤器
        filters:{

        },
        //自定义指令
        directive:{

        }
    }
</script>

<!--
    作者：liangyanxiangde@163.com
    时间：2017-03-27
    描述：统一使用less,局部样式
-->
<style lang="less" scoped>
.wrap{

}
.ace_editor{
    width:100%;
    flex-grow:1;

}




</style>