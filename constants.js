//exports.DHIS_URL_BASE = "https://uphmis.in/uphmis";
exports.DHIS_URL_BASE = "https://ln1.hispindia.org/uphmis230";
exports.username = "admin";
exports.password = "";

exports.program_doc_diary = "Bv3DaiOd5Ai";
exports.root_ou = "v8EzhiynNtf";
exports.attr_user = "fXG73s6W4ER";


exports.views = {
    login : "login",
    calendar : "calendar",
    entry : "entry",
    loading : "loader",
    settings: "settings"
};

exports.approval_status = {

    approved : "Approved",
    autoapproved : "Auto-Approved",
    rejected : "Rejected",
    resubmitted : "Re-submitted",
    pending2 : "Pending2",
    pending1 : "Pending1"
    
}

exports.approval_usergroup_level2_code="approval2ndlevel";
exports.approval_usergroup_level1_code="approval1stlevel";

exports.report_types = {

    approved: "approved",
    pending:"pending",
    rejected : "rejected"
}

exports.approval_status_de = "W3RxC0UOsGY";
exports.approval_rejection_reason_de = "CCNnr8s3rgE";

exports.attr_releiving_date = "mE6SY3ro53v";

exports.no_of_csection = 38565556;
exports.csection_detail = 96496270;
exports.no_of_anaesthesia = 38565551;
exports.anaesthesia_detail = 96511588;


exports.query_completeReport = function(ps,ou,sdate,edate,deid){

return `

select distinct 
max(case when tea.trackedentityattributeid in (77702712) then tea.value end) as ehrmsid,
max(case when tea.trackedentityattributeid in (38565533) then tea.value end) as NAME,
max(case when tea.trackedentityattributeid in (73441153) then tea.value end) as User_Type ,
max(case when tea.trackedentityattributeid in (97004406) then tea.value end) as User_Group,
max(ou.name)  as Facility,
max(ou.comment) as Type_of_Facility,
max(ou2.name)  as District, 
max(psi.executiondate)  as execution_date,
tedv_2.value as details,
max(tedv_2.dataelementid) as deid 

from programstageinstance psi
inner join programinstance pi on pi.programinstanceid=psi.programinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid=pi.trackedentityinstanceid
inner join trackedentityattributevalue tea on tea.trackedentityinstanceid=tei.trackedentityinstanceid
inner join trackedentitydatavalue tedv_1 on psi.programstageinstanceid=tedv_1.programstageinstanceid
inner join trackedentitydatavalue tedv_2 on psi.programstageinstanceid=tedv_2.programstageinstanceid
inner join programstage ps on psi.programstageid=ps.programstageid
inner join dataelement de on tedv_2.dataelementid=de.dataelementid
inner join organisationunit ou on ou.organisationunitid=tei.organisationunitid
inner join organisationunit ou1 on ou.parentid=ou1.organisationunitid
inner join organisationunit ou2 on ou1.parentid=ou2.organisationunitid
where  tei.organisationunitid in (select organisationunitid 
									from organisationunit 
									where path like '%${ou}%')
		
and tedv_2.dataelementid in (${deid})	
and tedv_2.value != '^-?[0-9]+.?[0-9]*$'						
and tedv_1.dataelementid = 88199674 and tedv_1.value != '' 
and psi.executiondate between '${sdate}' and '${edate}'
and ps.uid in ('${ps}') 
group by ps.name,ou.name,ou2.name,psi.executiondate,ou.comment,tedv_2.value,tedv_2.dataelementid
order by execution_date


`

}

exports.query_dailyReport = function(ps,ou,sdate,edate,deid){
return `select distinct 
max(case when tea.trackedentityattributeid in (77702712) then tea.value end) as ehrmsid,
max(case when tea.trackedentityattributeid in (38565533) then tea.value end) as NAME,
max(case when tea.trackedentityattributeid in (73441153) then tea.value end) as User_Type ,
max(case when tea.trackedentityattributeid in (97004406) then tea.value end) as User_Group,
max(ou.name)  as Facility,
max(ou.comment) as Type_of_Facility,
max(ou2.name)  as District, 
max(psi.executiondate)  as execution_date,
max(case when tedv.dataelementid in (${deid}) then tedv.value end) as provided ,
max(case when tedv.dataelementid = 84526242 then tedv.value end) as comment_if_any ,
max(case when (tedv_1.dataelementid = 88199674) then tedv_1.value end) as Approval_Status


, 
max(tedv.dataelementid) as deid,
max(case when (tedv.dataelementid = 88199674 and tedv.value in ('Approved','Auto-Approved','Rejected')) then tedv.lastupdated end) as Approval_Date

from programstageinstance psi
inner join programinstance pi on pi.programinstanceid=psi.programinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid=pi.trackedentityinstanceid
inner join trackedentityattributevalue tea on tea.trackedentityinstanceid=tei.trackedentityinstanceid
inner join trackedentitydatavalue tedv on psi.programstageinstanceid=tedv.programstageinstanceid
inner join trackedentitydatavalue tedv_1 on psi.programstageinstanceid=tedv_1.programstageinstanceid
inner join programstage ps on psi.programstageid=ps.programstageid
inner join dataelement de on tedv.dataelementid=de.dataelementid
inner join organisationunit ou on ou.organisationunitid=tei.organisationunitid
inner join organisationunit ou1 on ou.parentid=ou1.organisationunitid
inner join organisationunit ou2 on ou1.parentid=ou2.organisationunitid
and tei.organisationunitid in (select organisationunitid 
									from organisationunit 
									where path like '%${ou}%')
and psi.executiondate between '${sdate}' and '${edate}'
and ps.uid in ('${ps}') 
and tedv_1.value in ('Pending1','Approved','Auto-Approved','Rejected')
group by ps.name,ou.name,ou2.name,psi.executiondate,ou.comment
order by execution_date

`
}

exports.query_monthReport = function(ps,ou,sdate,edate){
    return `select tea.value as ehrmsid, tea_.value as NAME,tea_r.value as User_Type ,ps.name as User_Group, ou.name as Facility,ou.comment as Type_of_Facility,ou2.name as District, psi.executiondate as Date,
tedv.value as Anaesthesia_provided ,tedv_2.value as Anaesthesia_details ,tea_r.value as Certifying_specialist ,tedv_1.value as Approval_Status from programstageinstance psi
inner join programinstance pi on pi.programinstanceid=psi.programinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid=pi.trackedentityinstanceid
inner join trackedentityattributevalue tea on tea.trackedentityinstanceid=tei.trackedentityinstanceid
inner join trackedentityattributevalue tea_ on tea_.trackedentityinstanceid=tei.trackedentityinstanceid
inner join trackedentityattributevalue tea_r on tea_r.trackedentityinstanceid=tei.trackedentityinstanceid
inner join trackedentitydatavalue tedv on psi.programstageinstanceid=tedv.programstageinstanceid
inner join trackedentitydatavalue tedv_1 on psi.programstageinstanceid=tedv_1.programstageinstanceid
inner join trackedentitydatavalue tedv_2 on psi.programstageinstanceid=tedv_2.programstageinstanceid
inner join programstage ps on psi.programstageid=ps.programstageid
inner join dataelement de on tedv.dataelementid=de.dataelementid
inner join dataelement de_ on tedv.dataelementid=de_.dataelementid
inner join organisationunit ou on ou.organisationunitid=tei.organisationunitid
inner join organisationunit ou1 on ou.parentid=ou1.organisationunitid
inner join organisationunit ou2 on ou1.parentid=ou2.organisationunitid
where tea.trackedentityattributeid =77702712 
and tei.organisationunitid in (select organisationunitid 
									from organisationunit 
									where path like '%${ou}%')
and tea_.trackedentityattributeid=38565533
and tea_r.trackedentityattributeid=73441153
and tedv.dataelementid=38565551
and tedv_1.dataelementid=88199674
and tedv_2.dataelementid=96511588
and psi.executiondate between '${sdate}' and '${edate}'
and ps.uid in ('${ps}')`

}

exports.query_ddReport = function(ps,ou,sdate,edate){
return `select 
pi.trackedentityinstanceid,
max(psiou.uid) as psiouuid,
max(ou.uid) as ouuid,
max(ou.comment) as outype,
max(ou.name) as facility,
max(block.name) as block,
max(district.name) as district,
max(division.name) as division,
array_agg(distinct concat(tea.uid,':',teav.value)) as attrlist,
array_agg(distinct concat(de,':',devalue)) as delist
from programinstance pi
left join (
	select tei.organisationunitid,pi.trackedentityinstanceid as tei,de.uid as de,sum(tedv.value::float8) as devalue
	from programstageinstance psi
	inner join programinstance pi on pi.programinstanceid = psi.programinstanceid
	inner join trackedentitydatavalue tedv on tedv.programstageinstanceid = psi.programstageinstanceid	
	inner join dataelement de on de.dataelementid = tedv.dataelementid
	inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
	where tedv.value ~ '^-?[0-9]+.?[0-9]*$' and tedv.value !='0'
	and de.valuetype = 'NUMBER'
	and psi.executiondate between '${sdate}' and '${edate}'
	and psi.programstageid in (select programstageid 
								from programstage 
								where uid in ( '${ps}'))
	and tei.organisationunitid in (select organisationunitid 
									from organisationunit 
									where path like '%${ou}%')
	group by pi.trackedentityinstanceid,de.uid,tei.organisationunitid
	
	union
	select tei.organisationunitid,pi.trackedentityinstanceid as tei,
tedv.value,count(tedv.value)
	from programstageinstance psi
	inner join programinstance pi on pi.programinstanceid = psi.programinstanceid
	inner join trackedentitydatavalue tedv on tedv.programstageinstanceid = psi.programstageinstanceid
	inner join trackedentitydatavalue tedv_1 on tedv_1.programstageinstanceid = psi.programstageinstanceid
	inner join dataelement de on de.dataelementid = tedv.dataelementid
	inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
	and psi.executiondate between '${sdate}' and '${edate}'
	and de.uid in ('x2uDVEGfY4K')
	and psi.programstageid in (select programstageid 
								from programstage 
								where uid in ( '${ps}'))
	and tei.organisationunitid in (select organisationunitid 
									from organisationunit 
									where path like '%${ou}%')
    and tedv_1.dataelementid = 88199674 and tedv_1.value != ''
	group by pi.trackedentityinstanceid,de.uid,tei.organisationunitid,tedv.value
)tedv
on pi.trackedentityinstanceid = tedv.tei
right join trackedentityattributevalue teav on pi.trackedentityinstanceid = teav.trackedentityinstanceid
inner join trackedentityattribute tea on tea.trackedentityattributeid = teav.trackedentityattributeid
inner join organisationunit ou on ou.organisationunitid = pi.organisationunitid
left join organisationunit psiou on psiou.organisationunitid = tedv.organisationunitid
left join organisationunit block on ou.parentid = block.organisationunitid
left join organisationunit district on block.parentid = district.organisationunitid
left join organisationunit division on district.parentid = division.organisationunitid
inner join 
(
	select distinct teav.trackedentityinstanceid,ps.name as speciality
	from programstageusergroupaccesses psuga
	inner join programstage ps on ps.programstageid = psuga.programid
	inner join usergroupaccess uga on uga.usergroupaccessid = psuga.usergroupaccessid
	inner join usergroup ug on ug.usergroupid = uga.usergroupid
	inner join usergroupmembers ugm on ugm.usergroupid = ug.usergroupid
	inner join users u on u.userid = ugm.userid
	inner join trackedentityattributevalue teav on teav.value = u.username
	where psuga.programid in (select programstageid 
				from programstage 
				where uid in ( '${ps}' ))
	group by u.username,teav.trackedentityinstanceid,ps.name
)filteredusers
on filteredusers.trackedentityinstanceid = pi.trackedentityinstanceid
inner join trackedentityinstance tei on tei.trackedentityinstanceid = pi.trackedentityinstanceid
inner join trackedentitytype tet on tei.trackedentitytypeid = tet.trackedentitytypeid
where tet.uid = 'lI7LKVfon5c'
and pi.programid in (select programid from program where uid='Bv3DaiOd5Ai')
and pi.organisationunitid in (select organisationunitid 
				from organisationunit 
				where path like '%${ou}%')
group by pi.trackedentityinstanceid,division.organisationunitid,district.organisationunitid,block.organisationunitid,ou.name
order by division.name,district.name,block.name,ou.name`

}


exports.cache_curr_user = "dd_current_user";
exports.cache_user_prefix = "dd_user_";
exports.cache_program_metadata = "dd_program_metadata";

exports.lsas_emoc_data_de = "ZnzjYCK4r9w";
exports.emoc_data_de = "qgzoi2gteWu";

exports.disabled_fields = [
    'OZUfNtngt0T',
    'CCNnr8s3rgE'
];

exports.required_fields = [
    'x2uDVEGfY4K'
]

exports.query_jsonize = function(q){
    return `select json_agg(main.*) from (
            ${q}
            
        )main`;
}
