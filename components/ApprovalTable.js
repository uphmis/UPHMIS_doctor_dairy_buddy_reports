import React,{propTypes} from 'react';
import api from '../dhis2API';
import constants from '../constants';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';


export function ApprovalTable(props){

    var instance = Object.create(React.Component.prototype);
    instance.props = props;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var state = {
        user : props.user,
        program : props.program,
        rawData:props.rawData,
        usergroup1 : props.usergroup1,
        usergroup2 : props.usergroup2,
        sdate : props.sdate,
        edate:props.edate,
        selectedOU:props.selectedOU,
        selectedName:props.selectedName,
        selectedSpeciality : props.selectedSpeciality,
        seletedUserGroup: props.seletedUserGroup,
        ous : props.ous,
        headerLength : 10,
        dataO: []
    };
    state.rawData.reduce(function(list,data,index) {
        if (state.selectedName === "bb_complete") {
            if (data.details.match("^[0-9]*$")) {
                state.rawData.splice(index, 1);
            }
        }
        return data;
    })
    var dataList = [];
    state.dataO = state.rawData.reduce(function(list,data){
        var nameObj ='';

        if(state.selectedName === "bb_complete" || state.selectedName === "bb_date"){
            nameObj = data.ehrmsid;
        }
        else if(state.selectedName === "bb_month")
        {
            nameObj = data.attrlist.reduce(function(str,obj){
                if(obj.split(":")[0] === 'T6eQvMXe3MO')
                {
                    str = obj.split(":")[1];
                }
                return str;
            },'');
        }

        if((state.selectedSpeciality === 'Kd8DRRvZDro' && state.seletedUserGroup == 'all') ||
            (state.selectedSpeciality === 'Bm7Bc9Bnqoh' && state.seletedUserGroup == 'all') ||
            (state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh" && state.seletedUserGroup == 'all')
        ){
            dataList.push(data);
        }
        else {
            if(state.seletedUserGroup === state.usergroup1.id) {
                state.usergroup1.users.forEach(function (user) {
                    if(nameObj === user.userCredentials.username){
                        dataList.push(data);
                    }
                });
            }
            else if(state.seletedUserGroup === state.usergroup2.id) {
                state.usergroup2.users.forEach(function (user) {
                    if(nameObj === user.userCredentials.username){
                        dataList.push(data);
                    }
                });
            }
        }
        return dataList;
    },[]);
    var programStageMap = state.program.programStages.reduce(function(map,obj){
        map[obj.id] = obj;
        return map;
    },[]);


    var ouMap = state.ous.reduce(function(map,obj){
        map[obj.id] = obj;
        return map;
    },[]);

    var selectedStage;
    var reportName = "";
    console.log(state.selectedSpeciality);
    var groupName = "";
    if(state.seletedUserGroup === state.usergroup1){
        groupName = "of Buddy-Buddy Group 1";
    }
    else if(state.seletedUserGroup === state.usergroup2){
        groupName = "of Buddy-Buddy Group 2";
    }
    else if(state.seletedUserGroup === 'all'){
        groupName = "of all Buddy-Buddy Group";
    }
    if(state.selectedName === "bb_complete") {
        reportName = "Buddy-Buddy Complete Report (Last 12 months)";
    }
    else if(state.selectedName === "bb_date") {
        reportName = "Buddy-Buddy Date Wise Report";
    }
    else if(state.selectedName === "bb_month") {
        reportName = "Buddy-Buddy Month Wise Report";
    }
    if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh")
    {
        selectedStage = programStageMap["Kd8DRRvZDro"] && programStageMap["Bm7Bc9Bnqoh"];
        reportName = reportName+" (Both LSAS and EMOC)";
    }
    else{
        selectedStage = programStageMap[state.selectedSpeciality];
        reportName = reportName+" ("+selectedStage.name+")";
    }
        reportName = reportName + groupName;


    instance.render = render;
    return instance;

    function getHeader(){
        var list = [];

        list.push(<th className="approval_normal"  key="h_code">Ehrms Id</th>);
        list.push(<th className="approval_normal"  key="h_code">Name</th>);
        list.push(<th className="approval_normal"  key="h_code">User Type</th>);
        list.push(<th className="approval_normal"  key="h_code">User Group</th>);

        list.push(<th className="approval_wideX"  key="h_ou">Facility</th>);
        list.push(<th className="approval_wideX"  key="h_ou">Type of Facility</th>);
        list.push(<th className="approval_wideX"  key="h_ou">District</th>);
        if(state.selectedName === "bb_month") {
            list.push(<th className="approval_wideX" key="h_ou">Month</th>);
        }
        else{
            list.push(<th className="approval_wideX" key="h_ou">Date</th>);
            list.push(<th className="approval_wideX" key="h_ou">Month</th>);
        }
        if(state.selectedName === "bb_complete")
        {

            for(var i=0;i<=3;i++)
            {
                list.push(<th className="approval_wideX"  key="h_ou">Name of Patient</th>);
                list.push(<th className="approval_wideX"  key="h_ou">RCH ID</th>);
                list.push(<th className="approval_wideX"  key="h_ou">Case ID</th>);
                if(state.selectedSpeciality === "Kd8DRRvZDro"){
                    list.push(<th className="approval_wideX"  key="h_ou">LSAS ehrms id</th>);
                }
                else if(state.selectedSpeciality === "Bm7Bc9Bnqoh"){
                    list.push(<th className="approval_wideX"  key="h_ou">EMOC ehrms id</th>);
                }
                else if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"){
                    list.push(<th className="approval_wideX"  key="h_ou">EMOC ehrms id</th>);
                    list.push(<th className="approval_wideX"  key="h_ou">LSAS ehrms id</th>);
                }
                list.push(<th className="approval_wideX"  key="h_ou">Details of Doctor on call</th>);
                list.push(<th className="approval_wideX"  key="h_ou">MBBS doctor 1</th>);
                list.push(<th className="approval_wideX"  key="h_ou">MBBS doctor 2</th>);
                list.push(<th className="approval_wideX"  key="h_ou">Staff Nurse 1</th>);
                list.push(<th className="approval_wideX"  key="h_ou">Staff Nurse 2</th>);
                list.push(<th className="approval_wideX"  key="h_ou">OT Technician 1</th>);
                list.push(<th className="approval_wideX"  key="h_ou">OT Technician 2</th>);
                list.push(<th className="approval_wideX"  key="h_ou">4th Class Staff Nurse 1</th>);
                list.push(<th className="approval_wideX"  key="h_ou">4th Class Staff Nurse 2</th>);
                list.push(<th className="approval_wideX"  key="h_ou">4th Class Staff Nurse 3</th>);
                list.push(<th className="approval_wideX"  key="h_ou">4th Class Staff Nurse 4</th>);
            }
        }
        else if(state.selectedName === "bb_date")
        {
            if(state.selectedSpeciality === "Bm7Bc9Bnqoh"){
                list.push(<th className="approval_wideX"  key="h_ou">No. of Anaesthesia given</th>);
            }
            else if(state.selectedSpeciality === "Kd8DRRvZDro"){
                list.push(<th className="approval_wideX"  key="h_ou">No. of C-Sections</th>);
            }
            else if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"){
                list.push(<th className="approval_wideX"  key="h_ou">No. of Anaesthesia given</th>);
                list.push(<th className="approval_wideX"  key="h_ou">No. of C-Sections</th>);
            }
            list.push(<th className="approval_wideX"  key="h_ou">Approval Status</th>);
            list.push(<th className="approval_wideX"  key="h_ou">Approval/Rejection Date</th>);
            list.push(<th className="approval_wideX"  key="h_ou">Comments(if any)</th>);
        }
        else if(state.selectedName === "bb_month")
        {
            if(state.selectedSpeciality === "Bm7Bc9Bnqoh"){
                list.push(<th className="approval_wideX"  key="h_ou">No. of Anaesthesia given</th>);
            }
            else if(state.selectedSpeciality === "Kd8DRRvZDro"){
                list.push(<th className="approval_wideX"  key="h_ou">No. of C-Sections</th>);
            }
            else if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"){
                list.push(<th className="approval_wideX"  key="h_ou">No. of Anaesthesia given</th>);
                list.push(<th className="approval_wideX"  key="h_ou">No. of C-Sections</th>);
            }
        }
        console.log(list.length);

        state.headerLength = list.length;
        return list;
    }

    function getRows(){

        return state.dataO.reduce(function(list,data,index) {

            console.log(state.selectedName);
            var date_month = new Date(data.execution_date);
            data.execution_date = new Date(data.execution_date).toLocaleDateString("en-GB");

            var month = monthNames[date_month.getMonth()];

            var _list = [];
            var _mapList = [];

            if (state.selectedName === "bb_complete" || state.selectedName === "bb_date") {

                _list.push(<td className="approval_normal" key="d_erhms code">{data.ehrmsid}</td>);
                _list.push(<td className="approval_wide" key="d_name of specilist">{data.name}</td>);
                _list.push(<td className="approval_wide" key="user_type"> {data.user_type}</td>);
                _list.push(<td className="approval_wide" key="user_group">{data.user_group}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{data.facility}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{data.type_of_facility}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{data.district}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{data.execution_date}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{month}</td>);
            }
            else if (state.selectedName === "bb_month") {

                var dvMap = data.delist.reduce(function (map, obj) {
                    map[obj.split(":")[0]] = obj.split(":")[1];
                    return map;
                }, []);

                var attrMap = data.attrlist.reduce(function (map, obj) {
                    map[obj.split(":")[0]] = obj.split(":")[1];
                    return map;
                }, []);


                if ((state.selectedSpeciality === 'Kd8DRRvZDro' && attrMap["qXQxtcuPO5S"] == 'emoc')
                    || (state.selectedSpeciality === 'Bm7Bc9Bnqoh' && attrMap["qXQxtcuPO5S"] == 'LSAS')
                    || (state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"
                        && (attrMap["qXQxtcuPO5S"] == 'emoc' || attrMap["qXQxtcuPO5S"] == 'LSAS'))) {



                _list.push(<td className="approval_normal" key="d_erhms code">{attrMap["T6eQvMXe3MO"]}</td>);
                _list.push(<td className="approval_wide" key="d_name of specilist">{attrMap["U0jQjrOkFjR"]}</td>);
                _list.push(<td className="approval_wide" key="user_type"> {attrMap["qXQxtcuPO5S"]}</td>);
                _list.push(<td className="approval_wide" key="user_group">{attrMap["PjHXwfDU3GE"]}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{data.facility}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{data.outype}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{data.district}</td>);
                _list.push(<td className="approval_wideX" key="d_ou">{props.month}</td>);

                selectedStage.programStageDataElements.reduce(function (_list, obj) {
                    if (obj.dataElement.id === "zfMOVN2lc1S" || obj.dataElement.id === "wTdcUXWeqhN") {
                        if (state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh") {
                            _list.push(<td className={obj.valueType != "TEXT" ? "approval_nonText" : ""}
                                           key={"d" + obj.id + data.tei}>{dvMap["zfMOVN2lc1S"]}</td>);
                            _list.push(<td className={obj.valueType != "TEXT" ? "approval_nonText" : ""}
                                           key={"d" + obj.id + data.tei}>{dvMap["wTdcUXWeqhN"]}</td>);
                        } else {
                            _list.push(<td className={obj.valueType != "TEXT" ? "approval_nonText" : ""}
                                           key={"d" + obj.id + data.tei}>{dvMap[obj.dataElement.id]}</td>);
                        }
                    }

                    return _list;
                }, _list);
                list.push([<tr>{_list}</tr>]);

            }
        }
            if(state.selectedName === "bb_complete")
            {
                var doc_data = data.details;
                if(doc_data.startsWith("\""))
                {
                    doc_data = "{"+doc_data;
                }

                console.log(doc_data)
                    try{
                        var obj = JSON.parse(doc_data);
                        for(var i=0;i<=3;i++){
                            if(obj.data === undefined || !obj.data[i] )
                            {
                                if(state.selectedSpeciality === "Bm7Bc9Bnqoh" || state.selectedSpeciality === "Kd8DRRvZDro"){
                                    _list.push(<td colSpan="15"></td>  );
                                }
                                else{
                                    _list.push(<td colSpan="16"></td>  );
                                }
                            }
                            else{
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].patient_name ? obj.data[i].patient_name : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].rch_id ? obj.data[i].rch_id : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].case_id ? obj.data[i].case_id : ""}</td>);
                                if(state.selectedSpeciality === "Kd8DRRvZDro"){
                                    _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].id ? obj.data[i].id:""}</td>);
                                }
                                else if(state.selectedSpeciality === "Bm7Bc9Bnqoh"){
                                    _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].id ? obj.data[i].id:""}</td>);
                                }
                                else if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"){
                                    if(data.deid === constants.anaesthesia_detail)
                                    {
                                        _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].id ? obj.data[i].id:""}</td>);
                                        _list.push(<td className="approval_wideX"  key="h_ou"></td>);
                                    }
                                    else if(data.deid === constants.csection_detail)
                                    {
                                        _list.push(<td className="approval_wideX"  key="h_ou"></td>);
                                        _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].id ? obj.data[i].id:""}</td>);
                                    }

                                }

                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].doc_id ? obj.data[i].doc_id : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].mbBsDoctor[0] ? obj.data[i].mbBsDoctor[0] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].mbBsDoctor[1] ? obj.data[i].mbBsDoctor[1] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].supportingStaff[0] ? obj.data[i].supportingStaff[0] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].supportingStaff[1] ? obj.data[i].supportingStaff[1] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].otTechnician[0] ? obj.data[i].otTechnician[0] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].otTechnician[1] ? obj.data[i].otTechnician[1] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].classStaff && obj.data[i].classStaff[0] ? obj.data[i].classStaff[0] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].classStaff && obj.data[i].classStaff[1] ? obj.data[i].classStaff[1] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].classStaff && obj.data[i].classStaff[2] ? obj.data[i].classStaff[2] : ""}</td>);
                                _list.push(<td className="approval_wideX"  key="h_ou">{obj.data[i].classStaff && obj.data[i].classStaff[3] ? obj.data[i].classStaff[3] : ""}</td>);

                            }


                }
                }catch (e) {

                }

                list.push([<tr >{_list}</tr>]);
            }
            else if(state.selectedName === "bb_date")
            {
                if(state.selectedSpeciality === "Bm7Bc9Bnqoh"){
                    _list.push(<td className="approval_wideX"  key="h_ou">{data.provided?data.provided:""}</td>);
                }
                else if(state.selectedSpeciality === "Kd8DRRvZDro"){
                    _list.push(<td className="approval_wideX"  key="h_ou">{data.provided?data.provided:""}</td>);
                }
                else if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"){
                    _list.push(<td className="approval_wideX"  key="h_ou">{data.user_type === 'LSAS'?data.provided:""}</td>);
                    _list.push(<td className="approval_wideX"  key="h_ou">{data.user_type === 'emoc'?data.provided:""}</td>);
                }
                _list.push(<td className="approval_wideX"  key="h_ou">{data.approval_status?data.approval_status:""}</td>);
                _list.push(<td className="approval_wideX"  key="h_ou">{data.approval_date?data.approval_date:""}</td>);
                _list.push(<td className="approval_wideX"  key="h_ou">{data.comment_if_any?data.comment_if_any:""}</td>);

                list.push([<tr >{_list}</tr>]);
            }

            return list;
        },[]);

    }

    function getCaseHeader() {
        if(state.selectedName === "bb_complete") {
            var listcase = [];
            listcase.push(<th colSpan="9"></th>);
            for (var i = 0; i <= 3; i++) {
                if(state.selectedSpeciality === "Bm7Bc9Bnqoh" || state.selectedSpeciality === "Kd8DRRvZDro"){
                    listcase.push(<th colSpan="15">Case {(i + 1)}</th>);
                }
                else{
                    listcase.push(<th colSpan="16">Case {(i + 1)}</th>);
                }
            }
            state.headerLength = listcase.length;
        }
        return (<tr>{listcase}</tr>);
    }

    function render(){
        return (
            <div>
                <br/><br/>
                <ReactHTMLTableToExcel
                    id="test-table-xls-button"
                    className="download-table-xls-button"
                    table="table-to-xls"
                    filename={reportName+"_"+state.selectedOU.name+"_"+state.sdate+"-"+state.edate}
                    sheet="1"
                    buttonText="Download"/>
                <br/><br/>

                <table className="approvalTable report" id="table-to-xls">
                    <thead>

                    <tr>
                        <th colSpan={state.selectedName === "bb_complete"?74:(state.headerLength+4)}>{reportName}</th>
                    </tr>
                    {getCaseHeader()}
                    <tr>
                        {getHeader()}
                    </tr>
                    </thead>

                    <tbody>

                    {getRows()}
                    </tbody>
                </table>

            </div>
        )
    }

}

