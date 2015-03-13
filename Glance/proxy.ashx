<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.Web;
using System.Net;
using System.IO;

public class Handler : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        string url = context.Request["url"].ToString();
        string data = context.Request["data"].ToString();
        string method = context.Request.HttpMethod;
        string jsonResponse = ProxyRequest(method, url, data);

        context.Response.Cache.SetExpires(DateTime.Now);
        context.Response.ContentType = "application/json";
        context.Response.Write(jsonResponse);
        context.Response.End();
    }

    private string ProxyRequest(string method, string url, string data)
    {
        System.Net.HttpWebRequest wr = (HttpWebRequest)HttpWebRequest.Create(url);
        wr.Method = method.ToUpper();
        //wr.ContentType = "application/json";
        //wr.MediaType = "application/json";
        //wr.Accept = "application/json";


        string returndata = " ";

        var request = (HttpWebRequest)WebRequest.Create(url);
        request.Method = method.ToUpper();
        request.ContentType = "application/json";
        request.MediaType = "application/json";
        request.Accept = "application/json";

        if (data.Length > 0)
        {
            // Set the data to send.
            using (var streamWriter = new StreamWriter(request.GetRequestStream()))
            {
                streamWriter.Write(data);
            }
        }


        try
        {
            using (var response = request.GetResponse() as HttpWebResponse)
            {
                if (request.HaveResponse && response != null)
                {
                    using (var reader = new StreamReader(response.GetResponseStream()))
                    {
                        string result = reader.ReadToEnd();
                        returndata = result;
                    }
                }
            }
        }
        catch (WebException wex)
        {
            if (wex.Response != null)
            {
                using (var errorResponse = (HttpWebResponse)wex.Response)
                {
                    using (var reader = new StreamReader(errorResponse.GetResponseStream()))
                    {
                        string error = reader.ReadToEnd();
                        returndata = error;
                        //TODO: use JSON.net to parse this string and look at the error message
                    }
                }
            }
        }
        return returndata;


        //// Get the response.
        //var httpResponse = (HttpWebResponse)wr.GetResponse();
        //using (var streamReader = new StreamReader(httpResponse.GetResponseStream()))
        //{
        //    return streamReader.ReadToEnd();
        //}
    }


    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}