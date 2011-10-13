from django.http import HttpResponse
from django.template import Context, loader
import simplejson
from BeautifulSoup import BeautifulSoup

import urllib2
import urllib

from google.appengine.api import urlfetch



siteurl = {'twitter': 'http://twitter.com/', 'flickr': 'http://www.flickr.com/photos/' , 'digg': 'http://digg.com/users/'}
sitelen = {'twitter': 19, 'flickr': 29, 'digg': 22}

siteid='twitter'


def tes11t(request, id=None,):   
        site ='twitter'
        friend_l = getContacts(id,'twitter')
	t = loader.get_template('dots.html')
	c = Context({'id': id, 'friends':  simplejson.JSONEncoder().encode(friend_l), 'flen' :len(friend_l), 'site' :site , 'siteurl': 'http://twitter.com/' })
	return HttpResponse(t.render(c))

def test(request, id=None,):  
        uid = request['id']
	url = 'http://twitter.com/m1ck'
	#url = 'http://amidala.gsu.edu/temp/test.cfm'

	req_headers = {'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.0.8) Gecko/2009032609 Firefox/3.0.8 (.NET CLR 3.5.30729) ',}
	req = urllib2.Request(url, None, req_headers)
	pag = urllib2.urlopen(req)
        page= pag.read()
	return HttpResponse(page)
	#page = urlfetch.Fetch('http://www.facebook.com/people/Charles-Scott/757539312').content 
	opener = urllib2.build_opener()
        opener.addheaders = [('User-agent', 'Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.9.0.8) Gecko/2009032609 Firefox/3.0.8 (.NET CLR 3.5.30729) ')]

	pag = opener.open("http://amidala.gsu.edu/temp/test.cfm")
        page= pag.read()
	soup = BeautifulSoup(page)
	for img in soup.html.body.findAll('img'):
		imgcrc = img.get('src')
		if imgcrc[-3:] == 'jpg':
		   image = imgcrc
		   break

	return HttpResponse(page)

def getpic(request, site=None,):   
        uid = request['id']
	if site == 'facebook':
		url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http://www.facebook.com/people/"+ uid +"%22%20and%20xpath%3D%22%2F%2Fimg%22&format=json"
		search_results = urllib.urlopen(url)
		json = simplejson.loads(search_results.read())
		results = json['query']['results']['img']
		mypic=""
		doc =  '<topalbums artist="django">'
		for i in  range(0, 2):
			info = results[i]  	
			mypic  = info['src']
		doc +=  '<album>'
		doc +=  '<image>'
		doc +=  '<small>%s</small>'  %  mypic
		doc +=  '</image>'
		doc +=  '</album>'
		doc +=  '</topalbums>'  
		
	if site == 'twitter':
		url = "http://twitter.com/"+ uid 
		page = urllib.urlopen(url)
		soup = BeautifulSoup(page)
		for i in soup.html.body.findAll('img'):
			   if i.get('id') =='profile-image':
			       image= i.get('src')               
			       break
		doc +=  '<topalbums artist="Madonna">'
		doc +=  '<album>'
		doc +=  '<image>'
		doc +=  '<small>%s</small>'  %  image
		doc +=  '</image>'
		doc +=  '</album>'
		doc +=  '</topalbums>'  
			
	return HttpResponse(doc,  mimetype='application/xml')




def getcontacts(request, site=None,): 
        uid = request['id']

	if site == 'facebook':
		url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http://www.facebook.com/people/"+ uid +"%22%20and%20xpath%3D%22%2F%2Ftable%5B%40id%3D'public_grid'%5D%2F%2Fa%22&format=json"
		doc = '<similarartists>'
		search_results = urllib.urlopen(url)
		json = simplejson.loads(search_results.read())
		results = json['query']['results']['a']
		wheel_list = []
		for i in  range(0, len(results)):
		  info = results[i]
		  for types in info:
			if types == 'img':
				doc +=  '<artist>'
				doc +=   '<name>%s</name>'  % (info['href'][33:])
				doc +=   '<image>%s</image>'  % (info['img']['src'])
				doc +=   '<title>%s</title>'  % (info['title'])
				doc +=   '</artist>'
		doc +=   '</similarartists>'


	if site == 'twitter':
		doc =  '<similarartists>'

		url = "http://twitter.com/"+ uid

		page = urllib.urlopen(url)
		soup = BeautifulSoup(page)
		for a in soup.html.body.findAll('a'):
			rel = str(a.get('rel'))
			if rel == 'contact':
			   uname= str(a.get('href'))[19:]
			   if str(a.get('href')).find('api') > 1:
			      uname = str(a.get('href'))[23:]
			   doc +=  '<artist>'
			   doc +=  '<name>%s</name>'  % uname
			   doc +=  '<image>%s</image>' %  a.img.get('src')
			   doc +=  '<title>%s</title>'  % uname #% str(a.get('title'))
			   doc +=  '</artist>'
		doc +=  '</similarartists>'

        return HttpResponse(doc,mimetype='application/xml')















