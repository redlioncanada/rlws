<?php
/**
 * Content controller.
 * 
 * @package api-framework
 * @author  Martin Bean <martin@martinbean.co.uk> / Matt Graham <themattyg@gmail.com>
 */
class ContentController extends BaseController {
	
	protected $db;
	
	public function __construct() {
		parent::__construct();
		$this->db = "rl_contentbox";
	}
	
    /**
     * GET method.
     * 
     * @param  Request $request
     * @return string
     */
    public function get($request)
    {
        
        $data = $this->get_content();
        $categories = new CategoriesController();
        $cats = $categories->get($request);
        
        foreach ($data as &$content) {
	        for ($x = 1; $x < count($cats); $x++) {
		        if ($cats[$x]['id'] == $content['categories_id']) {
			        $cats_id = $x;
			        break;
			    }
	        }
	        $catdata = $cats[$cats_id];
	        $content['xsize'] = $catdata['xsize'];
	        $content['ysize'] = $catdata['ysize'];
	        $content['hex_color'] = $catdata['hex_color'];
        }
        
        switch (count($request->url_elements)) {
            case 1:
                return $data;
            break;
            case 2:
                $id = $request->url_elements[1];
                return $data[$id];
            break;
        }
    }
    
    /**
     * POST action.
     *
     * @param  $request
     * @return null
     */
    public function post($request)
    {
		/*
        switch (count($request->url_elements)) {
            case 1:
                // validation should go here
                $id = (count($articles) + 1);
                $articles = $this->readArticles();
                $article = array(
                    'id' => $id,
                    'title' => $request->parameters['title'],
                    'content' => $request->parameters['content'],
                    'published' => date('c')
                );
                $articles[] = $article;
                $this->writeArticles($articles);
                header('HTTP/1.1 201 Created');
                header('Location: /news/'.$id);
                return null;
            break;
        }
		*/
    }
    
    /**
     * Read articles.
     *
     * @return array
     */
    protected function get_content()
    {
        return $this->get_all();
    }
    
    /**
     * Write articles.
     *
     * @param  string $articles
     * @return boolean
     */
    protected function writeArticles($articles)
    {
        
    }
}