<?php

/**
 * AbstractController class.
 *
 * @package  api-framework
 * @author   Matt Graham (themattyg@gmail.com)
 */
class BaseController {
	
	protected $sql;
	private $server = 'localhost';
	private $username = 'root';
	private $password = 'Burdon68';
	private $dbname = 'rlcity';
	
	public function __construct() {
		$this->sql = new mysqli('localhost', 'root', 'Burdon68', 'rlcity');
		if ($sql->connect_error) {
			die("DB Connection Failed");
		}
	}
	
	protected function get_all() {
		$return = array();
		$results = $this->sql->query("SELECT * FROM ".$this->db);
		foreach($results as $result) {
			$id = $result['id'];
			unset($result['id']);
			$return[$id] = $result;
		}
		return $return;
	}
}