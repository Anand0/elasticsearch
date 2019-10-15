$(document).ready(function() {
  
    var performSearch = true;
	// https://search.getegrabber.com
    var baseurl = "https://search.getegrabber.com";  
    $.ajaxSetup({
      contentType: 'application/json',
      connection: 'Keep-Alive'
    });

      function formatPhoneNumber1(phoneNumberString) {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
        var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3]
        }
        return null
      } 

      function formatPhoneNumber(phoneNumberString) {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
        var match = cleaned.match(/^(\d{3})(\d{3})$/)
        if (match) {
            return  match[1] + '-' + match[2]
        }
        return null
      }

      function formatPhoneNumberCoutryCode(phoneNumberString) {
        var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
        var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
        if (match) {
          var intlCode = (match[1] ? '+1 ' : '')
          return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('')
        }
        return null
      }

      
    autocomplete('#aa-search-input', {}, [
        {
          minLength: 3,
          source: function( request, response ) {
            
           var phoneval = ""
           var phone1 = "";
           var phone2 = "";
           var phone3 = "";
           var phone4 = "";
           var phone5 = "";
            var obj ;
            if (request.length === undefined || request.length == 0){
                $("#aa-search-input").css('border-color', '#3a96cf');
               
            }

            if (request.length > 1){
                var regex=/^[0-9]+$/;
              var checkStr = request.substring(0, 1);
              if (checkStr.match(regex))
              {
                
                var n = request.includes("-");
                if (n == true){
                    phone1 = request.replace(/[^a-zA-Z0-9]/g, '');
                    phone2 = request;
                   
                        phone3 = formatPhoneNumberCoutryCode(phone1);
                        phone4 = formatPhoneNumberCoutryCode(phone2)
                    
                }
                else{
                
                    var phone_re = "";
              
                    phone_re = formatPhoneNumber(request);
                    phone3 = formatPhoneNumberCoutryCode(request);
                    phone4 = formatPhoneNumberCoutryCode(request)
              
                    if (phone_re != null){
                        phone2 = phone_re; //
                    }
                    
                    phone1 = request;
                 
                }
               
                 obj = 
                 { 
                    
                    "query": {
                      "multi_match": {
                        "query": phone1+" "+phone2+" "+phone3+" "+phone4,
                        "operator": "or", 
                        "cutoff_frequency" : 0.001,
                        "zero_terms_query": "all",
                        "fields": ["phone"]
                      }
                    },
                    "highlight": {
                      "fields": {
                        "phone": {}
                      }
                    }
                }
              }
              else if (request.includes("@") || request.includes(".com") || request.includes(".in") || request.includes(".co")){
                obj = {
                    "query": {
                          "match_phrase_prefix" : {
                              "EMail": request
                          }
                      },"highlight": {
                        "fields": {
                          "EMail": {}
                         
                        }
                      }
                  }
                }
                else{
                
                    obj = 
                    {
                        "size": 4, 
                        "query": {
                          "multi_match": {
                            "query": request,
                            "type": "phrase_prefix", 
                            "auto_generate_synonyms_phrase_query": "true", 
                            "operator": "and", 
                            "cutoff_frequency" : 0.001,
                            "fields": ["EMail","phone","regkey","Name","Product","Company"]
                            
                          }
                        },
                        "highlight": {
                          "fields": {
                            "Name": {},
                            "EMail": {},
                            "Product": {},
                            "Company": {},
                            "phone": {},
                            "regkey": {}
                          }
                        }
                  }
              }
             
            }
   
            
            
            //XHTTP call to ES make sure this matches YOUR ES info
            var sendData = JSON.stringify(obj);
            var url = baseurl+"/licenseadmin1/_search";
            var xhr;
            var op;
                var jqxhr;
            if (performSearch) { 
               
             jqxhr = $.post( url,sendData, function(data,status,xhrs) {
                var res1 = data.hits
                var totalrec = res1.total
            // TODO :- One way of checking
          /*      if (data.hits.hits[0] === undefined){
    
                }  */
                var finaloutput = [];
                if (totalrec == 0){
                  finaloutput = [];
                  response(finaloutput);
                }
                else{
                    $("#aa-search-input").css('border-color', '#3a96cf');
                op = data.hits.hits;
                 ($.map(op, function(item) {
                    var output = {};
                    var resultObj = {};
                    var source = item._source;
                    var highLigts = item.highlight;
                    var reg_key = "";
                    var Product = "";
                    var Key_type = "";
                    var Created_Date = "";
                    var name = "";
                    var company = "";
                    var email = "";
                    var phone = "";
                    var reDirectUri_start = "https://www.egrabbersupport.com/scripts/eregportal/keyreport.php?regkey="
                    var reDirectUri_end = "&search_regkey=3";
                    var reDirectUri = "";
                    if (highLigts !== undefined){
                      if (highLigts["regkey"] === undefined || highLigts["regkey"] == null){
                        reg_key = source.regkey;
                        reDirectUri = reDirectUri_start+reg_key+reDirectUri_end;
                    }else{
                        reg_key = highLigts["regkey"];
                        reDirectUri = reDirectUri_start+reg_key+reDirectUri_end;
                    }
                    if (highLigts["Product"] === undefined || highLigts["Product"] == null){
                        Product = source.Product;
                    }else{
                        Product = highLigts["Product"]
                    }
                    if (highLigts["Name"] === undefined || highLigts["Name"] == null){
                        name = source.Name;
                    }else{
                        name = highLigts["Name"]
                    }
                    if (highLigts["key_type"] === undefined || highLigts["key_type"] == null){
                        Key_type = source.key_type;
                    }else{
                        Key_type = highLigts["key_type"];
                    }
                    if (highLigts["EMail"] === undefined || highLigts["EMail"] == null){
                        email = source.EMail;
                    }else{
                        email = highLigts["EMail"];
                    }
                    if (highLigts["Company"] === undefined || highLigts["Company"] == null){
                        company = source.Company;
                    }else{
                        company = highLigts["Company"]
                    }
                    if (highLigts["phone"] === undefined || highLigts["phone"] == null){
                        phone = source.phone;
                    }else{
                        phone = highLigts["phone"];
                    }
                    if (highLigts["created_date"] === undefined || highLigts["created_date"] == null){
                        Created_Date = source.created_date;
                    }else{
                        Created_Date = highLigts["created_date"];
                    }
                    output.reg_key = reg_key;
                    output.Product = Product;
                    output.name = name;
                    output.Key_type = Key_type;
                    output.email = email;
                    output.company = company;
                    output.phone = phone;
                    output.Created_Date = Created_Date;
                    output.reDirectUri = reDirectUri;
                    resultObj.source = output;
                    finaloutput.push(resultObj)
                }
              })); 
                response(finaloutput);
            }              
              })
                .done(function() {
                 
                })
                .fail(function(data) {
             
                })
                .always(function() {
                  
                });
            
              jqxhr.always(function() {
              
              });   
              setTimeout(function()
              { 
                if (jqxhr && jqxhr.readyState != 4)
                {
                    jqxhr.abort();  
               
                } 
              }, 1300);
       
        }
     
          },
          
          templates: {
            header: '<div class="aa-suggestions-category">LICENSE ADMIN</div>',
           
            suggestion({source}) {

                $("#aa-search-input").css('border-color', '#3a96cf');
         
                var longVal = source.name+", "+source.email+", "+source.company+", "+source.phone;
                var reDirectUri = source.reDirectUri;
               
                reDirectUri = reDirectUri.replace(/<\/?[^>]+(>|$)/g, "");
              return `<span class="product-header">${source.Product} / ${source.Key_type}</span><a class="product-des" target="_blank" href= "${reDirectUri}">${longVal}</span>`;

            }
           
          },
     
        },

        {
          minLength: 3,
          source: function(request, response){
            var phoneval = ""
            var phone1 = "";
            var phone2 = "";
            var phone3 = "";
            var phone4 = "";
            var phone5 = "";
             var obj ;
             if (request.length === undefined || request.length == 0){
                 $("#aa-search-input").css('border-color', '#3a96cf');
                
             }
 
             if (request.length > 1){
                 var regex=/^[0-9]+$/;
               var checkStr = request.substring(0, 1);
               if (checkStr.match(regex))
               {
                 
                 var n = request.includes("-");
                 if (n == true){
                     phone1 = request.replace(/[^a-zA-Z0-9]/g, '');
                     phone2 = request;
                    
                         phone3 = formatPhoneNumberCoutryCode(phone1);
                         phone4 = formatPhoneNumberCoutryCode(phone2)      
                 }
                 else{
                     var phone_re = "";
                     phone_re = formatPhoneNumber(request);
                     phone3 = formatPhoneNumberCoutryCode(request);
                     phone4 = formatPhoneNumberCoutryCode(request)
               
                     if (phone_re != null){
                         phone2 = phone_re; //
                     }
                      phone1 = request;
                 }
                
                  obj = 
                  { 
                     
                     "query": {
                       "multi_match": {
                         "query": phone1+" "+phone2+" "+phone3+" "+phone4,
                         "operator": "or", 
                         "cutoff_frequency" : 0.001,
                         "zero_terms_query": "all",
                         "fields": ["phone"]
                       }
                     },
                     "highlight": {
                       "fields": {
                         "phone": {}
                       }
                     }
                 }
               }
               else if (request.includes("@") || request.includes(".com") || request.includes(".in") || request.includes(".co")){
                obj = {
                    "query": {
                          "match_phrase_prefix" : {
                              "email": request
                          }
                      },"highlight": {
                        "fields": {
                          "email": {}
                         
                        }
                      }
                  }
                }
               else{
                 $("#aa-search-input").css('border-color', '#3a96cf'); 
                 obj = 
                 {
                     "size": 4, 
                     "query": {
                       "multi_match": {
                         "query": request,
                         "type": "phrase_prefix",
                         "auto_generate_synonyms_phrase_query": "true", 
                         "operator": "and", 
                         "cutoff_frequency" : 0.001,
                         "fields": []
                         
                       }
                     },
                     "highlight": {
                       "fields": {
                         "fullName": {},
                         "email": {},
                         "industry": {},
                         "phone": {},
                         "product": {},
                         "promo": {},
                         "status":{}
                       }
                     }
                 }
                
               }
              
             }
            //  var baseurl = "http://ec2-13-233-172-254.ap-south-1.compute.amazonaws.com:9200"
             //XHTTP call to ES make sure this matches YOUR ES info
             var sendData = JSON.stringify(obj);
             var url = baseurl+"/crm_data1/_search";
             var xhr;
             var op;
                 var jqxhr;
             if (performSearch) { 
                
              jqxhr = $.post( url,sendData, function(data,status,xhrs) {
                 var res1 = data.hits
                 var totalrec = res1.total
             // TODO :- One way of checking
         
                 var finaloutput = [];
                 if (totalrec == 0){
                     // $("#aa-search-input").css('border-color', 'red');
                     finaloutput = [];
                     response(finaloutput)
                 }
                 else{
                     $("#aa-search-input").css('border-color', '#3a96cf');
                 op = data.hits.hits;
                  ($.map(op, function(item) {
                     var output = {};
                     var resultObj = {};
                     var source = item._source;
                     var highLigts = item.highlight;
                     var reg_key = "";
                     var product = "";
                     var industry = "";
                     var created_date = "";
                     var fullName = "";
                     var status = "";
                     var email = "";
                     var phone = "";
                     var crm_id = item._id;  // https://www.myprodex.com/apps/sfa/index.php?module=Leads&#38;view=Detail&#38;record=312695&#38;app=MARKETING
                     var reDirectUri_start = "https://www.myprodex.com/apps/sfa/index.php?module=Leads&#38;view=Detail&#38;record="
                     var reDirectUri_end = "&#38;app=MARKETING";
                     var reDirectUri = "";
                     created_date = source.created_date;
                     reg_key = source.regkey;
                     reDirectUri = reDirectUri_start+crm_id+reDirectUri_end;
                     if (highLigts !== undefined){
                         // console.log("im called here")
                     if (highLigts["product"] === undefined || highLigts["product"] == null){
                      product = source.product;
                     }else{
                      product = highLigts["product"]
                     }
                     if (highLigts["fullName"] === undefined || highLigts["fullName"] == null){
                      fullName = source.fullName;
                     }else{
                      fullName = highLigts["fullName"]
                     }
                     if (highLigts["promo"] === undefined || highLigts["promo"] == null){
                      promo = source.promo;
                     }else{
                      promo = highLigts["promo"];
                     }
                     if (highLigts["email"] === undefined || highLigts["email"] == null){
                      email = source.email;
                     }else{
                      email = highLigts["email"];
                     }
                     if (highLigts["industry"] === undefined || highLigts["industry"] == null){
                      industry = source.industry;
                     }else{
                      industry = highLigts["industry"]
                     }
                     if (highLigts["phone"] === undefined || highLigts["phone"] == null){
                         phone = source.phone;
                     }else{
                         phone = highLigts["phone"];
                     }
          
                     if (highLigts["status"] === undefined || highLigts["status"] == null){
                      status = source.status;
                      }else{
                        status = highLigts["status"];
                      }
 
                     output.reg_key = reg_key;
                     output.product = product;
                     output.fullName = fullName;
                     output.promo = promo;
                     output.email = email;
                     output.industry = industry;
                     output.phone = phone;
                     output.status = status;
                     output.created_date = created_date;
                     output.reDirectUri = reDirectUri;
                     resultObj.source = output;
                     finaloutput.push(resultObj)
 
                 }
                 else{
                     // $("#aa-search-input").css('border-color', 'red');
                 }
               })); 
                 response(finaloutput);
             }
                
               })
                 .done(function() {
                  
                 })
                 .fail(function(data) {
                 
                 })
                 .always(function() {
                   
                 });
             
               jqxhr.always(function() {
               
               });   
               setTimeout(function()
               { 
                
                 if (jqxhr && jqxhr.readyState != 4)
                 {
                     jqxhr.abort();  
                
                 } 
               }, 1300);
        
         }
          },
          templates: {
            header: '<div class="aa-suggestions-category">CRM</div>',
           
            suggestion({source}) {

                $("#aa-search-input").css('border-color', '#3a96cf');
         
                var longVal = source.fullName+", "+source.email+", "+source.industry+", "+source.phone;
                var reDirectUri = source.reDirectUri;
               
                reDirectUri = reDirectUri.replace(/<\/?[^>]+(>|$)/g, "");
              return `<span class="product-header">${source.promo} / ${source.status}</span><a class="product-des" target="_blank" href= "${reDirectUri}">${longVal}<p>${source.created_date}</p></span>`;

            }
           
          }
        }, 

        {
          minLength: 3,
          source: function(request, response){
            
            var obj;
            
                 $("#aa-search-input").css('border-color', '#3a96cf'); 
                 obj = 
                 {
                     "size": 4, 
                     "query": {
                       "multi_match": {
                         "query": request,
                         "type": "phrase_prefix",
                         "auto_generate_synonyms_phrase_query": "true", 
                         "operator": "and", 
                         "cutoff_frequency" : 0.001,
                         "fields": []
                         
                       }
                     },
                     "highlight": {
                       "fields": {
                         "createrEmail": {},
                         "assigned_to": {},
                         "createName": {},
                         "comments": {},
                         "product": {},
                         "content": {},
                         "status":{},
                         "bugid":{},
                         "assignName":{}
                       }
                     }
                 }
             
            //  var baseurl = "http://ec2-13-233-172-254.ap-south-1.compute.amazonaws.com:9200"
             //XHTTP call to ES make sure this matches YOUR ES info
             var sendData = JSON.stringify(obj);
             var url = baseurl+"/bugzilla_data/_search";
             var xhr;
             var op;
                 var jqxhr;
             if (performSearch) { 
                
              jqxhr = $.post( url,sendData, function(data,status,xhrs) {
                 var res1 = data.hits
                 var totalrec = res1.total
             // TODO :- One way of checking
           /*      if (data.hits.hits[0] === undefined){
     
                 }  */
                 var finaloutput = [];
                 if (totalrec == 0){
                     finaloutput = [];
                     response(finaloutput);
                 }
                 else
                 {
                     $("#aa-search-input").css('border-color', '#3a96cf');
                     op = data.hits.hits;
                    ($.map(op, function(item) {
                     var output = {};
                     var resultObj = {};
                     var source = item._source;
                     var highLigts = item.highlight;
                     var createrEmail = "";
                     var product = "";
                     var assigned_to = "";
                     var createName = "";
                     var comments = "";
                     var status = "";
                     var content = "";
                     var assignName = "";
                     var creeated_date = ""
                     var bugid = "";
                     var reDirectUri_start = "https://www.myprodex.com/apps/bugz/show_bug.cgi?id="
                     bugid = source.bugid;
                     var reDirectUri = "";
                     created_date = source.date;
                     reg_key = source.regkey;
                     reDirectUri = reDirectUri_start+bugid;
                     if (highLigts !== undefined){
                     
                     if (highLigts["product"] === undefined || highLigts["product"] == null){
                      product = source.product;
                     }else{
                      product = highLigts["product"]
                     }
                     if (highLigts["createrEmail"] === undefined || highLigts["createrEmail"] == null){
                      createrEmail = source.createrEmail;
                     }else{
                      createrEmail = highLigts["createrEmail"]
                     }
                     if (highLigts["assigned_to"] === undefined || highLigts["assigned_to"] == null){
                      assigned_to = source.assigned_to;
                     }else{
                      assigned_to = highLigts["assigned_to"];
                     }
                     if (highLigts["createName"] === undefined || highLigts["createName"] == null){
                      createName = source.createName;
                     }else{
                      createName = highLigts["createName"];
                     }
                     if (highLigts["assignName"] === undefined || highLigts["assignName"] == null){
                      assignName = source.assignName;
                     }else{
                      assignName = highLigts["assignName"];
                     }
                     if (highLigts["status"] === undefined || highLigts["status"] == null){
                      status = source.status;
                     }else{
                      status = highLigts["status"]
                     }
                     if (highLigts["content"] === undefined || highLigts["content"] == null){
                      content = source.content;
                     }else{
                      content = highLigts["content"];
                     }
                     if (highLigts["comments"] === undefined || highLigts["comments"] == null){
                      // comments = source.comments;
                     }else{
                      comments = highLigts["comments"];
                     }
                 
                     output.bugid = bugid;
                     output.createrEmail = createrEmail;
                     output.assigned_to = assigned_to;
                     output.createName = createName;
                     output.assignName = assignName;
                     output.status = status;
                     output.content = content;
                     output.status = status;
                     output.comments = comments;
                     output.product = product;
                     output.created_date = created_date;
                     output.reDirectUri = reDirectUri;
                     resultObj.source = output;
                     finaloutput.push(resultObj)
 
                    }
                    else{
                        // $("#aa-search-input").css('border-color', 'red');
                    }
                    })); 
                      response(finaloutput);
                 }
                
               })
                 .done(function() {
                  
                 })
                 .fail(function(data) {
              
                 })
                 .always(function() {
                   
                 });
             
               jqxhr.always(function() {
               
               });   
               setTimeout(function()
               { 
              
                 if (jqxhr && jqxhr.readyState != 4)
                 {
                     jqxhr.abort();  
                
                 } 
               }, 1100);
        
         }
          },
          templates: {
            header: '<div class="aa-suggestions-category">Bugzila</div>',
           
            suggestion({source}) {

                $("#aa-search-input").css('border-color', '#3a96cf');
         
                var longVal = source.bugid+" - "+source.product+" - "+source.content;
                var reDirectUri = source.reDirectUri;
               
                reDirectUri = reDirectUri.replace(/<\/?[^>]+(>|$)/g, "");
            
              return `<span class="product-header">${source.assignName} / ${source.status}</span><a class="product-des" target="_blank" href= "${reDirectUri}">${longVal}<p>${source.comments}...Read more...</p></span>`;

            }
           
          }
        },
        {
            minLength: 3,
            source: function( request, response ) {
              
                    var op;
                    var obj = {
                        "size": 7,
                        "query": {
                            "multi_match": {
                         "query": request,
                         "operator": "and", 
                         
                         "fields": ["content"]
                       }
                        },
                        "highlight": {
                            "type" : "unified",
                            "number_of_fragments" : 3,
                            "fields": {
                                "content": {}
                            }
                        }
                    }
                    // var baseurl = "http://ec2-13-233-172-254.ap-south-1.compute.amazonaws.com:9200"
                    //XHTTP call to ES make sure this matches YOUR ES info
                    var sendData = JSON.stringify(obj);
                    var url = baseurl+"/websiteidx/_search";
                    var jqxhr;
                    jqxhr = $.post( url,sendData, function(data,status,xhrs) {
                        var res1 = data.hits
                        var totalrec = res1.total
                       
                        var finaloutput = [];
                        if (totalrec == 0){
                            // $("#aa-search-input").css('border-color', 'red');
                            finaloutput = [];
                            response(finaloutput);
                        }
                        else{
                            $("#aa-search-input").css('border-color', '#3a96cf');
                            op = data.hits.hits;
                          
                            ($.map(op, function(item) {
                            
                               var output = {};
                               var resultObj = {};               
                               var source = item._source;
                               var highLigts = item.highlight;
                               var faq = "";
                               var faqUrl = "";
                               var product = "";
                            if (highLigts !== undefined){
                                faq = highLigts["content"];
                                faqUrl = source.url;
                                product = source.product
                            }else{
                                faq = source.content;
                                faqUrl = source.url;
                                product = source.product
                            }
                            output.product = product
                            output.faq = faq;
                            output.url = source.url;
                            resultObj.source = output;
                            finaloutput.push(resultObj);
                            }))
                           
                            response(finaloutput);
                          }

                    })
                    .done(function() {
                 
                    })
                    .fail(function(data) {
                      
                    })
                    .always(function() {
                      
                    });
                
                  jqxhr.always(function() {
                  
                  });   
                  setTimeout(function()
                  { 
                 
                    if (jqxhr && jqxhr.readyState != 4)
                    {
                        jqxhr.abort();  
                
                    } 
                  }, 960);
                  

              },
              templates: {
                header: '<div class="aa-suggestions-category">FAQ</div>',
                suggestion({source}) {
        
              return `<span class="product-header">${source.product}</span><span class="product-des" onclick = "window.open('${source.url}','_blank');">${source.faq}</span>`;

            }
         
            }
        },{
            source: function( request, response ) {
                if (request.length === undefined || request.length == 0){
                    $("#aa-search-input").css('border-color', '#3a96cf');
                   
                }
                    var op;
                    var obj ={
                        "size": 4, 
                        "query": {
                          "multi_match": {
                            "query": request,
                            "operator": "and",
                            "fields": ["content","title"]
                            
                          }
                        },
                        "highlight": {
                          "fields": {
                            "content": {},
                            "title": {}
                              }
                            }
                        }
                    // var baseurl = "http://ec2-13-233-172-254.ap-south-1.compute.amazonaws.com:9200"
                    //XHTTP call to ES make sure this matches YOUR ES info
                    var sendData = JSON.stringify(obj);
                    // var url = baseurl+"/site_blog1/_search";
                    var url = baseurl+"/internal_blog1/_search";
                    var jqxhr;
                    jqxhr = $.post( url,sendData, function(data,status,xhrs) {
                        var res1 = data.hits
                        var totalrec = res1.total
                     
                        var finaloutput = [];
                        if (totalrec == 0){
                           
                            finaloutput = [];
                            response(finaloutput);
                        }
                        else{
                            $("#aa-search-input").css('border-color', '#3a96cf');
                            op = data.hits.hits;
                            ($.map(op, function(item) {
                            
                               var output = {};
                               var resultObj = {};
                               
                               var source = item._source;
                               var highLigts = item.highlight;
                               var rendered = "";
                               var content = ""
                               var url = "";
                               var product = "";

                            if (highLigts["title"] !== undefined){
                                rendered = highLigts["title"];
                                content = highLigts["content"];
                                url = source.url;
                              
                            }else{
                                rendered = source.title;
                                url = source.url;
                             
                            }

                            output.rendered = rendered;
                            output.url = url;
                            output.content = content;
                            resultObj.source = output;
                            finaloutput.push(resultObj);
                            }))
                         
                            response(finaloutput);
                         }

                    })
                    .done(function() {
                 
                    })
                    .fail(function(data) {
                       
                    })
                    .always(function() {
                      
                    });
                
                  jqxhr.always(function() {
                  
                  });   
                  setTimeout(function()
                  { 
                  
                    if (jqxhr && jqxhr.readyState != 4)
                    {
                        jqxhr.abort();  
                          
                    } 
                  }, 960);
            },
            templates: {
                header: '<div class="aa-suggestions-category">BLOG</div>',
                suggestion({source}) {
                    var contentStr = "";
                    if (source.content == undefined || source.content == ""){

                    }else{
                        contentStr = source.content;
                    //    var contentStr1 = GetContentsBetweenString(contentStr,"<em>","</em>");
                        console.log("Splitted Str==>"+contentStr);
                        var length1 = contentStr.length;
                        console.log("Length of FullStr==>"+length1);
                    }
          
              return `<span class="product-header">Category</span><span class="product-des" onclick = "window.open('${source.url}','_blank');">${source.rendered}<ul>${contentStr}...Read more...</ul></span>`;
            }
         
            }
        }
       
        
    ])
  
           .keydown(function (event,request) {
    
        if (event.keyCode == 8) {
            // performSearch = false; //do not perform the search
        } else {
            // performSearch = true; //perform the search
        } });



});