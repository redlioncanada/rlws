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
	private $username = 'redlionc_city';
	private $password = ']sTPTx8TO-]^';
	private $dbname = 'redlionc_rlcity';
	
	public function __construct() {
		$this->sql = new mysqli($this->server, $this->username, $this->password, $this->dbname);
		if ($this->sql->connect_error) {
			die("DB Connection Failed");
		}
	}
	
	protected function get_all() {
		$return = array();
		$query = "SELECT * FROM `".$this->db."`";
		$results = $this->sql->query($query);
		
		foreach($results as $result) {
			foreach ($result as &$content) {
				$content = utf8_encode($content);
			}
			$return[] = $result;
		}
		return $return;
	}
}