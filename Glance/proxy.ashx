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

        string jsonResponse = ProxyRequest(method, url, data, context);

        context.Response.Cache.SetExpires(DateTime.Now);
        context.Response.ContentType = "application/json";
        context.Response.Write(jsonResponse);
        context.Response.End();
    }

    private string ProxyRequest(string method, string url, string data, HttpContext context)
    {
        System.Net.ServicePointManager.Expect100Continue = false;
        System.Net.HttpWebRequest wr = (HttpWebRequest)HttpWebRequest.Create(url);
        wr.Method = method.ToUpper();

        string returndata = " ";
        var request = (HttpWebRequest)WebRequest.Create(url);
        request.Method = method.ToUpper();

        foreach (var key in context.Request.Headers.AllKeys)
        {
            if (((request.Headers[key] ?? "").Trim().Length == 0) &! (WebHeaderCollection.IsRestricted(key)) && (key.StartsWith("X") | key.StartsWith("Authorization")))
            {
                request.Headers.Add(key, context.Request.Headers[key]);
            }
        }
        if (context.Request.ContentType.Length > 0)
        {
            wr.ContentType = context.Request.ContentType;
            request.ContentType = context.Request.ContentType; //"application/json";
        }
        if (context.Request.AcceptTypes.Length > 0)
        {
            request.Accept = context.Request.AcceptTypes[0]; //"application/json";
        }
        
        if (data.Length > 0)
        {
            // Set the data to send.
            request.ContentLength = data.Length;
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
                    }
                }
            }
        }
        return returndata;

    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}