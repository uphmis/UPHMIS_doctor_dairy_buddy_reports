import React,{propTypes} from 'react';
import api from '../dhis2API';
import {ApprovalTable} from './ApprovalTable';
import constants from '../constants';
import moment from 'moment';

export function ApprovalI(props){

    var instance = Object.create(React.Component.prototype);
    instance.props = props;

    var dailyType = false;
    var monthlyType = false;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var selectedMonth = "";

    var state = {
        selectedName : "-1",
        program : props.data.program,
        user : props.data.user,
        usergroup1: props.data.usergroup1,
        usergroup2:props.data.usergroup2,
        selectedOU : props.data.user.organisationUnits[0],
        orgUnitValidation : "",
        specialityValidation : "",
        reportTypeValidation : "",
        userValidation : "",
        ouMode : "DESCENDANTS",
        sdate : moment().subtract(1,'months').startOf('month').format("YYYY-MM-DD"),
        edate : moment().subtract(1,'months').endOf('month').format("YYYY-MM-DD"),
        selectedSpeciality : "-1",
        seletedUserGroup : "-1",
        ous : []
    };


    props.services.ouSelectCallback.selected = function(ou){

        state.selectedOU = ou;
        state.orgUnitValidation = ""
        instance.setState(state);
    }

    instance.render = render;
    return instance;

    function onSpecialityChange(e){
        state.selectedSpeciality = e.target.value;
        state.specialityValidation = "";
        state.rawData = null;
        instance.setState(state);
    }
    function onGroupChange(e){
        state.seletedUserGroup = e.target.value;
        state.userValidation = "";
        state.rawData = null;
        instance.setState(state);
    }
    function  onReportNameChange(e) {

        if(e.target.value === 'bb_date' || e.target.value === 'bb_complete')
        {
            dailyType = true;
            monthlyType = false;
        }
        else if(e.target.value === 'bb_month')
        {
            dailyType = false;
            monthlyType = true;
        }
        state.selectedName = e.target.value;
        state.reportTypeValidation = "";
        state.rawData = null;
        instance.setState(state);
    }

    function onOuModeChange(e){
        state.ouMode = e.target.value;
        instance.setState(state);
    }

    function onStartDateChange(e){
        state.sdate = e.target.value;
        instance.setState(state);
    }

    function onEndDateChange(e){
        state.edate = e.target.value;
        if ((Date.parse(state.sdate) >= Date.parse(state.edate))) {
            alert("End date should be greater than Start date");
        }
        else
        {
            instance.setState(state);
        }
    }

    function onTypeChange(e){
        state.type = e.target.value;
        instance.setState(state);

    }

    function validate(){

        if(state.selectedName== '-1')
        {
            state.reportTypeValidation = "Please select Report Name"
            instance.setState(state);
            return false;
        }
        if (state.selectedOU.id == undefined){
            state.orgUnitValidation = "Please select Facility from left bar"
            instance.setState(state);
            return false;
        }

        if (state.selectedSpeciality == "-1"){
            state.specialityValidation = "Please select Speciality"
            instance.setState(state);
            return false;
        }
        if ((Date.parse(state.sdate) >= Date.parse(state.edate))) {
            alert("End date should be greater than Start date");
            return false;
        }
        if(state.seletedUserGroup == '-1')
        {
            state.userValidation = "Please select Buddy Buddy Group"
            instance.setState(state);
            return false;
        }

        return true;
    }
    function getMonthDate(e)
    {
        var monthVal = e.target.value;
        var d = new Date();
        var startD;
        var endD;

        selectedMonth = monthNames[monthVal - 1]

        startD = d.setMonth(monthVal - 1,1);
        endD = d.setMonth(monthVal ,0);

        state.sdate = moment(startD).format("YYYY-MM-DD");
        state.edate = moment(endD).format("YYYY-MM-DD");

    }

    function getData(e){

        // validation
        if (!validate()){
            return;
        }

        state.rawData = null;
        state.loading=true;
        instance.setState(state);

        var Q = makeQuery();
        Q = constants.query_jsonize(Q);
        var sqlViewService = new api.sqlViewService();

        console.log(Q)
        sqlViewService.dip("DOC_DIARY_REPORT_",
            Q,makeReport);

        function makeReport(error,response,body){

            if (error){
                alert("An unexpected error happenned. Please check your network connection and try again.");
                return;
            }

            if (!body.listGrid.rows[0][0]){
                alert("No Data");
                state.loading=false;
                instance.setState(state);
                return;
            }
            state.rawData = JSON.parse(body.listGrid.rows[0][0].value);
            getOUWithHierarchy(function(error,response,body){
                if (error){
                    alert("An unexpected error happenned. Please check your network connection and try again.");
                    return;
                }

                state.ous = body.organisationUnits;
                state.loading=false;
                instance.setState(state);

            });
        }

        function makeQuery(){

            var rtVar = "";
            if(state.selectedName === "bb_complete")
            {
                var deid;

                if(state.selectedSpeciality === "Bm7Bc9Bnqoh"){ deid = constants.anaesthesia_detail }
                else if(state.selectedSpeciality === "Kd8DRRvZDro"){ deid = constants.csection_detail}
                else if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"){deid = constants.anaesthesia_detail+','+constants.csection_detail}
                rtVar = constants.query_completeReport(state.selectedSpeciality,
                    state.selectedOU.id,
                    state.sdate,
                    state.edate,deid);
            }
            else if(state.selectedName === "bb_date")
            {
                var deid;
                if(state.selectedSpeciality === "Bm7Bc9Bnqoh"){ deid = constants.no_of_anaesthesia }
                else if(state.selectedSpeciality === "Kd8DRRvZDro"){ deid = constants.no_of_csection}
                else if(state.selectedSpeciality === "Kd8DRRvZDro','Bm7Bc9Bnqoh"){deid = constants.no_of_anaesthesia+','+constants.no_of_csection}
                rtVar = constants.query_dailyReport(state.selectedSpeciality,
                    state.selectedOU.id,
                    state.sdate,
                    state.edate,deid);
            }
            else if(state.selectedName === "bb_month")
            {
              rtVar = constants.query_ddReport(state.selectedSpeciality,
                    state.selectedOU.id,
                    state.sdate,
                    state.edate);
            }
            return rtVar;
        }

        function getOUWithHierarchy(callback){

            var ous = state.rawData.reduce(function(list,obj){
                if (!list.includes(obj.ouuid)){
                    list.push(obj.ouuid)
                }
                return list;
            },[]);


            ous = ous.reduce(function(str,obj){
                if (!str){
                    str =  "" + obj + ""
                }else{
                    str = str + "," + obj + ""
                }

                return str;
            },null);

            var apiWrapper = new api.wrapper();
            var url = `organisationUnits.json?filter=id:in:[${ous}]&fields=id,name,ancestors[id,name,level]&paging=false`;

            apiWrapper.getObj(url,callback)
        }

    }



    function render(){

        function getApprovalTable(){

            if(!(state.rawData)){
                return (<div></div>)
            }
            return (<ApprovalTable key="approvaltable"  rawData={state.rawData} month ={selectedMonth} selectedOU={state.selectedOU} sdate={state.sdate} edate={state.edate} program={state.program} user={state.user} selectedName ={state.selectedName}  selectedSpeciality={state.selectedSpeciality} ous={state.ous}  usergroup1={state.usergroup1} usergroup2={state.usergroup2} seletedUserGroup ={state.seletedUserGroup}/>
            );

        }

        function getReportName(){

            var options = [
                <option disabled key="select_name" value="-1" selected> -- Select -- </option>
            ];

            options.push(<option  value={"bb_complete"}>Buddy Buddy Complete Report</option>);
            options.push(<option  value={"bb_month"}>Buddy Buddy Month Wise Report</option>);
            options.push(<option  value={"bb_date"}>Buddy Buddy Date Wise Report</option>);
            // options.push(<option  value="staff">Support Staff Report</option>);


            return options;
        }

        function getSpeciality(){

            var options = [
                <option disabled key="select_speciality" value="-1" selected> -- Select -- </option>
            ];

            options.push(<option  value={"Bm7Bc9Bnqoh"}>LSAS Report</option>);
            options.push(<option  value={"Kd8DRRvZDro"}>EMOC Report</option>);
            options.push(<option  value={"Kd8DRRvZDro','Bm7Bc9Bnqoh"}>Both (EMOC/LSAS) Report</option>);
           // options.push(<option  value="staff">Support Staff Report</option>);


            return options;
        }
        function getUserGroup(){

            var options = [
                <option disabled key="select_usergroup" value="-1"> -- Select -- </option>
            ];
            options.push(<option key = {state.usergroup1.id}  value={state.usergroup1.id} >{state.usergroup1.name}</option>);
            options.push(<option key = {state.usergroup2.id}  value={state.usergroup2.id} >{state.usergroup2.name}</option>);
            options.push(<option key = "all"  value="all" >Buddy Buddy All</option>);
            return options;
        }

        return (
            <div >
                <div className="card">
                <h3> Doc Diary Buddy Buddy Report</h3>

                <table className="tableBB">

                    <tr>
                        <td>Select Report Name<span style={{"color":"red"}}> * </span> :
                            <select  value={state.selectedName} onChange={onReportNameChange} id="report_name">
                                {getReportName()}</select><label  ><i>{state.reportTypeValidation}</i></label>
                        </td>
                        <td>Select Report Type<span style={{"color":"red"}}> * </span> :
                            <select  value={state.selectedSpeciality} onChange={onSpecialityChange} id="report">
                                {getSpeciality()}</select>
                            <label key="specialityValidation" ><i>{state.specialityValidation}</i></label>
                        </td>
                    </tr>
                    <tr>
                        <td>  Select Buddy-Buddy Group<span style={{"color":"red"}}> * </span> :

                        <select value={state.seletedUserGroup} onChange={onGroupChange} id="userGroup">
                            {getUserGroup()}</select>
                            <label key="userValidation" ><i>{state.userValidation}</i></label>
                        </td>
                        <td>Selected Facility<span style={{"color":"red"}}> * </span>  :
                            <input disabled  value={state.selectedOU.name}></input>
                            <label key="orgUnitValidation" ><i>{state.orgUnitValidation}</i></label>
                        </td>
                    </tr>
                    <tr>
                        <td className={!monthlyType?'hidden':'show'}>
                            Select Month <span style={{"color":"red"}}> * </span>  :<select onChange={getMonthDate}>
                                <option disabled value='-1' selected>--Select--</option>
                                <option value='1'>JAN</option>
                                <option value='2'>FEB</option>
                                <option value='3'>MAR</option>
                                <option value='4'>APR</option>
                                <option value='5'>MAY</option>
                                <option value='6'>JUN</option>
                                <option value='7'>JULY</option>
                                <option value='8'>AUG</option>
                                <option value='9'>SEP</option>
                                <option value='10'>OCT</option>
                                <option value='11'>NOV</option>
                                <option value='12'>DEC</option>
                            </select>
                        </td>
                        <td></td>
                    </tr>

                    <tr className={!dailyType?'hidden':'show'}>
                        <td>Select Start Period<span style={{"color":"red"}}> * </span> :
                            <input type="date" value={state.sdate} onChange = {onStartDateChange} ></input>
                        </td>

                        <td>Select End Period<span style={{"color":"red"}}> * </span>  :
                            <input type="date" value={state.edate} onChange = {onEndDateChange} ></input>
                        </td>
                    </tr>

                    <tr>
                        <td>  <input type="submit" value="Generate" onClick={getData} ></input></td>
                        <td> <img style = {state.loading?{"display":"inline"} : {"display" : "none"}} src="./images/loader-circle.GIF" alt="loader.." height="32" width="32"></img>  </td>

                    </tr>

                </table>
                </div>
                {getApprovalTable()}

            </div>
        )
    }

}

