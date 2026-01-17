import { Router } from 'express';
import { supabase } from '../auth/authClient';




export const getDailyCallStats = async ( aftertime: any, userId: String, type: String ) => {
  let { data, error } = await supabase
    .rpc('getdailycallstatsjson', {
      aftertime,
      type,
      useridentification: userId,
    })
  if (error) {throw new Error("error in retrieving daily statistics")};
  return data;
}


export const getCallStats = async ( beforeFirstTime:Number, beforeSecondTime: Number, callType: String, userId: String) => {
  let { data, error } = await supabase
    .rpc('getcallstats', {
      beforefirsttime: beforeFirstTime,
      beforesecondtime: beforeSecondTime,
      calltype: callType,
      useridentification: userId
    })
  console.log(data);
  if (error) {throw new Error("error in retrieving all statistics")};
  return data;
}

export const getDailyCallStatsAll = async (userId: String, type: String ) => {
  let { data, error } = await supabase
    .rpc('getdailycallstatsjsonall', {
      type,
      useridentification: userId,
    })
  if (error) {throw new Error("error in retrieving daily statistics")};
  return data;
}


export const getCallStatsAll = async (callType: String, userId: String) => {
  let { data, error } = await supabase
    .rpc('getcallstatsall', {
      calltype: callType,
      useridentification: userId
    })
  if (error) {throw new Error("error in retrieving all statistics")};
  return data;
}



export const getAgents11labs = async (userId: string) => {

    const { data, error } = await supabase
    .from('user_agent')
    .select()
    .eq('userid',userId)

    return data;
}

export const getTotalSecondsUsed = async (date: Number,userid: String) => {
    let { data, error } = await supabase
    .rpc('getseconds', {
      date,
      userid,
    })
    if (error) throw new Error("Issue with getting the total number of seconds")
    return data;
}